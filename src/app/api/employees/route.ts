import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

// Generate unique Employee ID
async function generateEmployeeId(): Promise<string> {
  // Find the highest employee ID number and increment it
  const lastEmployee = await User.findOne({ role: 'Employee' })
    .sort({ employeeId: -1 })
    .select('employeeId');
  
  if (!lastEmployee) {
    return 'EMP002'; // First employee after admin (EMP001)
  }

  // Extract number from EMP### format
  const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''), 10);
  const nextNumber = lastNumber + 1;
  return `EMP${String(nextNumber).padStart(3, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Only admins can view all employees
    if (currentUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const department = searchParams.get('department');

    const query: Record<string, unknown> = { role: 'Employee' };

    if (search) {
      query.$or = [
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) {
      query['profile.department'] = department;
    }

    const employees = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Only admins can add employees
    if (currentUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      password,
      department, 
      jobTitle, 
      phone 
    } = body;

    // Validate required fields (employeeId is now auto-generated)
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Check if employee already exists by email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      );
    }

    // Auto-generate Employee ID
    const employeeId = await generateEmployeeId();

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new employee with hashed password
    const newEmployee = await User.create({
      email,
      password: hashedPassword,
      employeeId,
      role: 'Employee',
      profile: {
        firstName,
        lastName,
        department: department || 'General',
        jobTitle: jobTitle || 'Employee',
        phone: phone || '',
        profilePicture: '',
        address: '',
        documents: [],
      },
      salary: {
        basicSalary: 50000,
        hra: 20000,
        transportAllowance: 3000,
        medicalAllowance: 2500,
        otherAllowances: 4500,
        taxDeduction: 8000,
        pfDeduction: 6000,
        otherDeductions: 200,
        netSalary: 65800,
        bankDetails: {
          bankName: '',
          accountNumber: '',
          ifscCode: '',
        },
      },
      leaveBalance: {
        paid: 12,
        sick: 10,
        unpaid: 0,
      },
    });

    const employee = await User.findById(newEmployee._id).select('-password');

    // Send welcome email with credentials
    await sendWelcomeEmail({
      to: email,
      firstName,
      lastName,
      employeeId,
      password, // Send the plain password in email before it gets hashed
      department: department || 'General',
      jobTitle: jobTitle || 'Employee',
    });

    return NextResponse.json({ 
      message: 'Employee added successfully',
      employee 
    }, { status: 201 });
  } catch (error) {
    console.error('Add employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Only admins can delete employees
    if (currentUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('id');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const employee = await User.findById(employeeId);

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Prevent deleting admin accounts
    if (employee.role === 'Admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin accounts' },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(employeeId);

    return NextResponse.json({ 
      message: 'Employee removed successfully' 
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
