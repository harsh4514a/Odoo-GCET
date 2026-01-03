import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import LeaveRequest from '@/models/LeaveRequest';
import Attendance from '@/models/Attendance';
import { getCurrentUser } from '@/lib/auth';

function normalizeToMidnight(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Only admins can view dashboard stats
    if (currentUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await connectDB();

    const today = normalizeToMidnight(new Date());

    // Get total employees count
    const totalEmployees = await User.countDocuments({ role: 'Employee' });

    // Get employees on leave today
    const onLeaveToday = await Attendance.countDocuments({
      date: today,
      status: 'Leave',
    });

    // Get pending leave requests
    const pendingRequests = await LeaveRequest.countDocuments({
      status: 'Pending',
    });

    // Get today's attendance count
    const presentToday = await Attendance.countDocuments({
      date: today,
      status: { $in: ['Present', 'Half-day'] },
    });

    // Get recent leave requests (last 5)
    const recentLeaveRequests = await LeaveRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'employeeId profile.firstName profile.lastName');

    return NextResponse.json({
      stats: {
        totalEmployees,
        onLeaveToday,
        pendingRequests,
        presentToday,
      },
      recentLeaveRequests,
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
