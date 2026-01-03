'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceRecord {
  _id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  workHours: number;
}

interface AttendanceStats {
  present: number;
  absent: number;
  leave: number;
  halfDay: number;
  weekend: number;
  averageWorkHours: number;
}

export default function MyAttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, [currentMonth]);

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const [attendanceRes, statsRes] = await Promise.all([
        fetch(`/api/attendance/mark?startDate=${startDate}&endDate=${endDate}`),
        fetch('/api/attendance/stats'),
      ]);

      if (attendanceRes.ok) {
        const data = await attendanceRes.json();
        setAttendance(data.attendance || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceForDate = (date: Date): AttendanceRecord | undefined => {
    return attendance.find((a) => isSameDay(new Date(a.date), date));
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Present':
        return 'bg-green-500';
      case 'Absent':
        return 'bg-red-500';
      case 'Leave':
        return 'bg-blue-500';
      case 'Half-day':
        return 'bg-orange-500';
      case 'Weekend':
        return 'bg-slate-300';
      default:
        return 'bg-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      Present: 'bg-green-100 text-green-700',
      Absent: 'bg-red-100 text-red-700',
      Leave: 'bg-blue-100 text-blue-700',
      'Half-day': 'bg-orange-100 text-orange-700',
      Weekend: 'bg-slate-100 text-slate-600',
    };
    return <Badge className={config[status] || 'bg-slate-100'}>{status}</Badge>;
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Attendance</h1>
            <p className="text-slate-500 mt-1">Track your attendance history</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 bg-green-500 rounded-full" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats?.present || 0}</p>
              <p className="text-xs text-slate-500">Present</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats?.absent || 0}</p>
              <p className="text-xs text-slate-500">Absent</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats?.leave || 0}</p>
              <p className="text-xs text-slate-500">Leave</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats?.halfDay || 0}</p>
              <p className="text-xs text-slate-500">Half-day</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats?.averageWorkHours?.toFixed(1) || 0}h</p>
              <p className="text-xs text-slate-500">Avg Hours</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    {format(currentMonth, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                      className="h-8 w-8 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                      className="h-8 w-8 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before the first day of month */}
                  {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {monthDays.map((day) => {
                    const attendance = getAttendanceForDate(day);
                    const isToday = isSameDay(day, new Date());
                    const weekend = isWeekend(day);

                    return (
                      <motion.div
                        key={day.toISOString()}
                        whileHover={{ scale: 1.1 }}
                        className={cn(
                          'aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative cursor-pointer transition-colors',
                          isToday && 'ring-2 ring-purple-500 ring-offset-2',
                          weekend && !attendance && 'bg-slate-50'
                        )}
                      >
                        <span className={cn('font-medium', weekend && 'text-slate-400')}>
                          {format(day, 'd')}
                        </span>
                        {attendance && (
                          <div className={cn('w-2 h-2 rounded-full mt-1', getStatusColor(attendance.status))} />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-4 border-t flex flex-wrap gap-3">
                  {['Present', 'Absent', 'Leave', 'Half-day', 'Weekend'].map((status) => (
                    <div key={status} className="flex items-center gap-1.5">
                      <div className={cn('w-3 h-3 rounded-full', getStatusColor(status))} />
                      <span className="text-xs text-slate-600">{status}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed List */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
              <CardHeader>
                <CardTitle>Attendance Log</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Date</TableHead>
                          <TableHead>Check In</TableHead>
                          <TableHead>Check Out</TableHead>
                          <TableHead>Work Hours</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendance.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                              No attendance records for this month
                            </TableCell>
                          </TableRow>
                        ) : (
                          attendance.map((record, index) => (
                            <motion.tr
                              key={record._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.02 }}
                              className="hover:bg-slate-50"
                            >
                              <TableCell>
                                <div>
                                  <p className="font-medium">{format(new Date(record.date), 'MMM d, yyyy')}</p>
                                  <p className="text-xs text-slate-500">
                                    {format(new Date(record.date), 'EEEE')}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {record.checkInTime
                                  ? format(new Date(record.checkInTime), 'hh:mm a')
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {record.checkOutTime
                                  ? format(new Date(record.checkOutTime), 'hh:mm a')
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {record.workHours > 0 ? `${record.workHours.toFixed(2)}h` : '-'}
                              </TableCell>
                              <TableCell>{getStatusBadge(record.status)}</TableCell>
                            </motion.tr>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
