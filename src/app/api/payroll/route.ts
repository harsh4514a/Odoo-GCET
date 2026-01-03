import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || currentUser.userId;

    // Non-admins can only view their own payroll
    if (userId !== currentUser.userId && currentUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const user = await User.findById(userId).select('employeeId profile salary');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      payroll: {
        employeeId: user.employeeId,
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        department: user.profile.department,
        jobTitle: user.profile.jobTitle,
        salary: user.salary,
      }
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Only admins can update salary
    if (currentUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Only administrators can update salary structures' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { employeeId, salary } = body;

    if (!employeeId || !salary) {
      return NextResponse.json(
        { error: 'Employee ID and salary data are required' },
        { status: 400 }
      );
    }

    const grossSalary = 
      salary.basicSalary + 
      salary.hra + 
      salary.transportAllowance + 
      salary.medicalAllowance + 
      salary.otherAllowances;
    
    const totalDeductions = 
      salary.pfDeduction + 
      salary.taxDeduction + 
      salary.otherDeductions;

    const netSalary = grossSalary - totalDeductions;

    const user = await User.findByIdAndUpdate(
      employeeId,
      {
        $set: {
          'salary.basicSalary': salary.basicSalary,
          'salary.hra': salary.hra,
          'salary.transportAllowance': salary.transportAllowance,
          'salary.medicalAllowance': salary.medicalAllowance,
          'salary.otherAllowances': salary.otherAllowances,
          'salary.pfDeduction': salary.pfDeduction,
          'salary.taxDeduction': salary.taxDeduction,
          'salary.otherDeductions': salary.otherDeductions,
          'salary.netSalary': netSalary,
        },
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Salary structure updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update payroll error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
