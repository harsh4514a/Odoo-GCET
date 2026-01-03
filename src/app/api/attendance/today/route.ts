import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import { getCurrentUser } from '@/lib/auth';

function normalizeToMidnight(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
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

    const today = normalizeToMidnight(new Date());

    // Get today's attendance status
    const todayAttendance = await Attendance.findOne({
      user: currentUser.userId,
      date: today,
    });

    return NextResponse.json({
      todayAttendance,
      canCheckIn: !todayAttendance || (!todayAttendance.checkInTime),
      canCheckOut: todayAttendance?.checkInTime && !todayAttendance?.checkOutTime,
      hasCompletedToday: todayAttendance?.checkInTime && todayAttendance?.checkOutTime,
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
