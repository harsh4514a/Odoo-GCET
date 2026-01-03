import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import { getCurrentUser } from '@/lib/auth';

function normalizeToMidnight(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
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

    await connectDB();

    const today = normalizeToMidnight(new Date());
    const now = new Date();

    // Check if there's already an attendance record for today
    let attendance = await Attendance.findOne({
      user: currentUser.userId,
      date: today,
    });

    if (!attendance) {
      // First check-in of the day
      attendance = await Attendance.create({
        user: currentUser.userId,
        date: today,
        checkInTime: now,
        checkOutTime: null,
        status: 'Present',
        workHours: 0,
      });

      return NextResponse.json({
        message: 'Checked in successfully',
        attendance,
        action: 'check-in',
      });
    }

    if (attendance.checkInTime && !attendance.checkOutTime) {
      // User is checking out
      attendance.checkOutTime = now;
      const workHours =
        (now.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60);
      attendance.workHours = Math.round(workHours * 100) / 100;
      attendance.status = workHours >= 8 ? 'Present' : workHours >= 4 ? 'Half-day' : 'Present';
      await attendance.save();

      return NextResponse.json({
        message: 'Checked out successfully',
        attendance,
        action: 'check-out',
      });
    }

    if (attendance.checkInTime && attendance.checkOutTime) {
      return NextResponse.json(
        { error: 'Already checked out for today', attendance },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid attendance state' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Attendance mark error:', error);
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
    const userId = searchParams.get('userId') || currentUser.userId;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Non-admins can only view their own attendance
    if (userId !== currentUser.userId && currentUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const query: Record<string, unknown> = { user: userId };

    if (startDate && endDate) {
      query.date = {
        $gte: normalizeToMidnight(new Date(startDate)),
        $lte: normalizeToMidnight(new Date(endDate)),
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(30)
      .populate('user', 'employeeId profile.firstName profile.lastName');

    return NextResponse.json({ attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
