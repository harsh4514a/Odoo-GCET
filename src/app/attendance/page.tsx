'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarCheck, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  user: {
    _id: string;
    employeeId: string;
    profile: {
      firstName: string;
      lastName: string;
      department: string;
      profilePicture: string;
    };
  };
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  workHours: number;
}

interface Employee {
  _id: string;
  employeeId: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentMonth, selectedEmployee]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const [employeesRes, attendanceRes] = await Promise.all([
        fetch('/api/employees'),
        fetch(
          `/api/attendance/mark?startDate=${startDate}&endDate=${endDate}${
            selectedEmployee !== 'all' ? `&userId=${selectedEmployee}` : ''
          }`
        ),
      ]);

      if (employeesRes.ok) {
        const data = await employeesRes.json();
        setEmployees(data.employees);
      }

      if (attendanceRes.ok) {
        const data = await attendanceRes.json();
        setAttendance(data.attendance || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
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

  const filteredAttendance = attendance.filter((record) => {
    if (!record.user) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      record.user.profile.firstName.toLowerCase().includes(searchLower) ||
      record.user.profile.lastName.toLowerCase().includes(searchLower) ||
      record.user.employeeId.toLowerCase().includes(searchLower)
    );
  });

  // Calculate stats
  const stats = {
    present: filteredAttendance.filter((a) => a.status === 'Present').length,
    absent: filteredAttendance.filter((a) => a.status === 'Absent').length,
    leave: filteredAttendance.filter((a) => a.status === 'Leave').length,
    halfDay: filteredAttendance.filter((a) => a.status === 'Half-day').length,
  };

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
            <h1 className="text-3xl font-bold text-slate-900">Attendance Management</h1>
            <p className="text-slate-500 mt-1">Track and manage employee attendance</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 bg-green-500 rounded-full" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.present}</p>
              <p className="text-xs text-slate-500">Present</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.absent}</p>
              <p className="text-xs text-slate-500">Absent</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.leave}</p>
              <p className="text-xs text-slate-500">On Leave</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.halfDay}</p>
              <p className="text-xs text-slate-500">Half-day</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
                      )
                    }
                    className="rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <span className="text-lg font-semibold text-slate-900 min-w-[150px] text-center">
                    {format(currentMonth, 'MMMM yyyy')}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
                      )
                    }
                    className="rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search employee..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 rounded-xl"
                    />
                  </div>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="w-full sm:w-48 rounded-xl">
                      <SelectValue placeholder="All Employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp._id} value={emp._id}>
                          {emp.profile.firstName} {emp.profile.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-purple-600" />
                Attendance Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Employee</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Check In</TableHead>
                        <TableHead className="font-semibold">Check Out</TableHead>
                        <TableHead className="font-semibold">Work Hours</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAttendance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                            No attendance records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAttendance.map((record, index) => (
                          <motion.tr
                            key={record._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={record.user?.profile?.profilePicture} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xs">
                                    {record.user?.profile?.firstName?.[0]}
                                    {record.user?.profile?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {record.user?.profile?.firstName} {record.user?.profile?.lastName}
                                  </p>
                                  <p className="text-xs text-slate-500">{record.user?.employeeId}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {format(new Date(record.date), 'MMM d, yyyy')}
                                </p>
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
      </motion.div>
    </DashboardLayout>
  );
}
