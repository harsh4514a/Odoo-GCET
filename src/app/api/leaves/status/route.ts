import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { leaveStatusUpdateSchema } from '@/lib/validations';

function normalizeToMidnight(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
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

    // Only admins can update leave status
    if (currentUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Only administrators can approve or reject leave requests' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const validatedData = leaveStatusUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { leaveId, status, adminComments } = validatedData.data;

    const leaveRequest = await LeaveRequest.findById(leaveId);

    if (!leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    if (leaveRequest.status !== 'Pending') {
      return NextResponse.json(
        { error: 'This leave request has already been processed' },
        { status: 400 }
      );
    }

    leaveRequest.status = status;
    leaveRequest.adminComments = adminComments || '';
    await leaveRequest.save();

    // If approved, create attendance entries marked as 'Leave'
    if (status === 'Approved') {
      const startDate = new Date(leaveRequest.startDate);
      const endDate = new Date(leaveRequest.endDate);
      
      // Update user's leave balance
      const user = await User.findById(leaveRequest.user);
      if (user) {
        const leaveTypeKey = leaveRequest.leaveType.toLowerCase() as 'paid' | 'sick' | 'unpaid';
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        if (leaveRequest.leaveType !== 'Unpaid') {
          user.leaveBalance[leaveTypeKey] = Math.max(0, user.leaveBalance[leaveTypeKey] - diffDays);
          await user.save();
        }
      }

      // Create attendance records for each day of leave
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const normalizedDate = normalizeToMidnight(currentDate);
        
        // Skip weekends
        const dayOfWeek = normalizedDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          // Try to update existing record or create new one
          await Attendance.findOneAndUpdate(
            {
              user: leaveRequest.user,
              date: normalizedDate,
            },
            {
              user: leaveRequest.user,
              date: normalizedDate,
              checkInTime: null,
              checkOutTime: null,
              status: 'Leave',
              workHours: 0,
            },
            { upsert: true }
          );
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return NextResponse.json({
      message: `Leave request ${status.toLowerCase()} successfully`,
      leaveRequest,
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
