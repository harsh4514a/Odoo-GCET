'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Timer,
  TrendingUp,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react';

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
  averageWorkHours: number;
}

interface TodayAttendance {
  todayAttendance: AttendanceRecord | null;
  canCheckIn: boolean;
  canCheckOut: boolean;
  hasCompletedToday: boolean;
}

export function EmployeeDashboard() {
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayStatus, setTodayStatus] = useState<TodayAttendance | null>(null);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [todayRes, statsRes, attendanceRes] = await Promise.all([
        fetch('/api/attendance/today'),
        fetch('/api/attendance/stats'),
        fetch('/api/attendance/mark'),
      ]);

      if (todayRes.ok) {
        const data = await todayRes.json();
        setTodayStatus(data);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (attendanceRes.ok) {
        const data = await attendanceRes.json();
        setRecentAttendance(data.attendance?.slice(0, 7) || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      setIsMarking(true);
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
      });

      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    } finally {
      setIsMarking(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getGreetingIcon = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 18) {
      return <Sun className="w-6 h-6 text-yellow-500" />;
    }
    return <Moon className="w-6 h-6 text-indigo-500" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      Present: { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
      Absent: { variant: 'destructive', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
      Leave: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
      'Half-day': { variant: 'outline', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
      Weekend: { variant: 'secondary', className: 'bg-slate-100 text-slate-600 hover:bg-slate-100' },
    };
    const config = statusConfig[status] || statusConfig.Absent;
    return <Badge className={config.className}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          {getGreetingIcon()}
          <h1 className="text-3xl font-bold text-slate-900">
            {getGreeting()}, {user?.profile.firstName}!
          </h1>
        </div>
        <p className="text-slate-500">
          {format(currentTime, 'EEEE, MMMM d, yyyy')}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Days Present</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.present || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Days Absent</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.absent || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Leave Balance</p>
                <p className="text-3xl font-bold text-slate-900">
                  {(user?.leaveBalance.paid || 0) + (user?.leaveBalance.sick || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Avg. Work Hours</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats?.averageWorkHours?.toFixed(1) || '0'}h
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check In/Out Card */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-0 shadow-xl shadow-purple-500/10 rounded-2xl overflow-hidden h-full">
            <div className="h-2 bg-gradient-to-r from-purple-600 to-blue-600" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Timer className="w-5 h-5 text-purple-600" />
                Time Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Digital Clock */}
              <div className="text-center py-6">
                <motion.div
                  key={currentTime.toISOString()}
                  initial={{ scale: 0.95, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-mono font-bold text-slate-900 tracking-wider"
                >
                  {format(currentTime, 'HH:mm:ss')}
                </motion.div>
                <p className="text-slate-500 mt-2">{format(currentTime, 'EEEE')}</p>
              </div>

              {/* Today's Status */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Check In</span>
                  <span className="font-semibold text-slate-900">
                    {todayStatus?.todayAttendance?.checkInTime
                      ? format(new Date(todayStatus.todayAttendance.checkInTime), 'hh:mm a')
                      : '--:--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Check Out</span>
                  <span className="font-semibold text-slate-900">
                    {todayStatus?.todayAttendance?.checkOutTime
                      ? format(new Date(todayStatus.todayAttendance.checkOutTime), 'hh:mm a')
                      : '--:--'}
                  </span>
                </div>
                {todayStatus?.todayAttendance?.workHours ? (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-slate-600">Work Hours</span>
                    <span className="font-semibold text-purple-600">
                      {todayStatus.todayAttendance.workHours.toFixed(2)}h
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Action Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleMarkAttendance}
                  disabled={isMarking || todayStatus?.hasCompletedToday}
                  className={`w-full h-14 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300 ${
                    todayStatus?.canCheckOut
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/25'
                      : todayStatus?.hasCompletedToday
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-purple-500/25'
                  }`}
                >
                  {isMarking ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : todayStatus?.hasCompletedToday ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Completed for Today
                    </>
                  ) : todayStatus?.canCheckOut ? (
                    <>
                      <Clock className="w-5 h-5 mr-2" />
                      Check Out
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 mr-2" />
                      Check In
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAttendance.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No attendance records found</p>
                ) : (
                  recentAttendance.map((record, index) => (
                    <motion.div
                      key={record._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm">
                          <span className="text-xs text-slate-500">
                            {format(new Date(record.date), 'MMM')}
                          </span>
                          <span className="text-lg font-bold text-slate-900">
                            {format(new Date(record.date), 'd')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {format(new Date(record.date), 'EEEE')}
                          </p>
                          <p className="text-sm text-slate-500">
                            {record.checkInTime
                              ? `${format(new Date(record.checkInTime), 'hh:mm a')} - ${
                                  record.checkOutTime
                                    ? format(new Date(record.checkOutTime), 'hh:mm a')
                                    : 'In Progress'
                                }`
                              : 'No check-in'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {record.workHours > 0 && (
                          <span className="text-sm font-medium text-slate-600">
                            {record.workHours.toFixed(1)}h
                          </span>
                        )}
                        {getStatusBadge(record.status)}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Leave Balance Cards */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Leave Balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Paid Leave</p>
                  <p className="text-3xl font-bold text-green-600">{user?.leaveBalance.paid || 0}</p>
                  <p className="text-xs text-slate-400 mt-1">days remaining</p>
                </div>
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🌴</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Sick Leave</p>
                  <p className="text-3xl font-bold text-blue-600">{user?.leaveBalance.sick || 0}</p>
                  <p className="text-xs text-slate-400 mt-1">days remaining</p>
                </div>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🏥</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Unpaid Leave</p>
                  <p className="text-3xl font-bold text-slate-600">∞</p>
                  <p className="text-xs text-slate-400 mt-1">as needed</p>
                </div>
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
