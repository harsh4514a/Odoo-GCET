import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { leaveRequestSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const validatedData = leaveRequestSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { leaveType, startDate, endDate, reason } = validatedData.data;

    // Check leave balance
    const user = await User.findById(currentUser.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const leaveTypeKey = leaveType.toLowerCase() as 'paid' | 'sick' | 'unpaid';
    
    // Calculate number of days
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (leaveType !== 'Unpaid' && user.leaveBalance[leaveTypeKey] < diffDays) {
      return NextResponse.json(
        { error: `Insufficient ${leaveType} leave balance` },
        { status: 400 }
      );
    }

    const leaveRequest = await LeaveRequest.create({
      user: currentUser.userId,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending',
    });

    return NextResponse.json({
      message: 'Leave request submitted successfully',
      leaveRequest,
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const query: Record<string, unknown> = {};

    // Non-admins can only view their own requests
    if (currentUser.role !== 'Admin') {
      query.user = currentUser.userId;
    } else if (userId) {
      query.user = userId;
    }

    if (status) {
      query.status = status;
    }

    const leaveRequests = await LeaveRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'employeeId email profile.firstName profile.lastName profile.department profile.jobTitle');

    return NextResponse.json({ leaveRequests });
  } catch (error) {
    console.error('Get leave requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
