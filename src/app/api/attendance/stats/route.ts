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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || currentUser.userId;
    const days = parseInt(searchParams.get('days') || '30');

    // Non-admins can only view their own stats
    if (userId !== currentUser.userId && currentUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const endDate = normalizeToMidnight(new Date());
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const attendance = await Attendance.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const stats = {
      totalDays: attendance.length,
      present: attendance.filter((a) => a.status === 'Present').length,
      absent: attendance.filter((a) => a.status === 'Absent').length,
      halfDay: attendance.filter((a) => a.status === 'Half-day').length,
      leave: attendance.filter((a) => a.status === 'Leave').length,
      weekend: attendance.filter((a) => a.status === 'Weekend').length,
      averageWorkHours:
        attendance.length > 0
          ? Math.round(
              (attendance.reduce((sum, a) => sum + (a.workHours || 0), 0) /
                attendance.filter((a) => a.workHours > 0).length) *
                100
            ) / 100 || 0
          : 0,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
