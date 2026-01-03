'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
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
  Users,
  CalendarX,
  Clock,
  AlertCircle,
  Search,
  Eye,
  Check,
  X,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalEmployees: number;
  onLeaveToday: number;
  pendingRequests: number;
  presentToday: number;
}

interface LeaveRequest {
  _id: string;
  user: {
    _id: string;
    employeeId: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface Employee {
  _id: string;
  employeeId: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    jobTitle: string;
    department: string;
    profilePicture: string;
  };
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [processingLeave, setProcessingLeave] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [dashboardRes, leavesRes, employeesRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/leaves?status=Pending'),
        fetch('/api/employees'),
      ]);

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setStats(data.stats);
      }

      if (leavesRes.ok) {
        const data = await leavesRes.json();
        setPendingLeaves(data.leaveRequests);
      }

      if (employeesRes.ok) {
        const data = await employeesRes.json();
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId: string, status: 'Approved' | 'Rejected') => {
    try {
      setProcessingLeave(leaveId);
      const response = await fetch('/api/leaves/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaveId, status }),
      });

      if (response.ok) {
        setPendingLeaves((prev) => prev.filter((leave) => leave._id !== leaveId));
        // Update stats
        if (stats) {
          setStats({
            ...stats,
            pendingRequests: stats.pendingRequests - 1,
            onLeaveToday: status === 'Approved' ? stats.onLeaveToday + 1 : stats.onLeaveToday,
          });
        }
      }
    } catch (error) {
      console.error('Error processing leave:', error);
    } finally {
      setProcessingLeave(null);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      emp.profile.firstName.toLowerCase().includes(searchLower) ||
      emp.profile.lastName.toLowerCase().includes(searchLower) ||
      emp.email.toLowerCase().includes(searchLower) ||
      emp.employeeId.toLowerCase().includes(searchLower) ||
      emp.profile.department.toLowerCase().includes(searchLower)
    );
  });

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
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Overview of your organization • {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-600 to-blue-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.totalEmployees || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Present Today</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.presentToday || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">On Leave Today</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.onLeaveToday || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarX className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.pendingRequests || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Leave Requests */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Pending Requests
                </span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {pendingLeaves.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {pendingLeaves.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No pending requests</p>
                </div>
              ) : (
                pendingLeaves.map((leave, index) => (
                  <motion.div
                    key={leave._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-slate-50 rounded-xl space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm">
                          {leave.user.profile.firstName[0]}
                          {leave.user.profile.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {leave.user.profile.firstName} {leave.user.profile.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{leave.user.employeeId}</p>
                      </div>
                      <Badge
                        className={
                          leave.leaveType === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : leave.leaveType === 'Sick'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }
                      >
                        {leave.leaveType}
                      </Badge>
                    </div>

                    <div className="text-sm text-slate-600">
                      <p>
                        {format(new Date(leave.startDate), 'MMM d')} -{' '}
                        {format(new Date(leave.endDate), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{leave.reason}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleLeaveAction(leave._id, 'Approved')}
                        disabled={processingLeave === leave._id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                      >
                        {processingLeave === leave._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLeaveAction(leave._id, 'Rejected')}
                        disabled={processingLeave === leave._id}
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}

              {pendingLeaves.length > 0 && (
                <Link href="/leaves">
                  <Button variant="ghost" className="w-full mt-2">
                    View All Requests
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Employee List */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Employee Directory
                </CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 rounded-xl border-slate-200"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Employee</TableHead>
                      <TableHead className="font-semibold">Department</TableHead>
                      <TableHead className="font-semibold">Job Title</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                          No employees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.slice(0, 10).map((employee, index) => (
                        <motion.tr
                          key={employee._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border-2 border-slate-200">
                                <AvatarImage src={employee.profile.profilePicture} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm font-semibold">
                                  {employee.profile.firstName[0]}
                                  {employee.profile.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {employee.profile.firstName} {employee.profile.lastName}
                                </p>
                                <p className="text-xs text-slate-500">{employee.employeeId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                              {employee.profile.department}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {employee.profile.jobTitle}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/employees/${employee._id}`}>
                              <Button variant="ghost" size="sm" className="rounded-lg">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredEmployees.length > 10 && (
                <div className="mt-4 text-center">
                  <Link href="/employees">
                    <Button variant="outline" className="rounded-xl">
                      View All {filteredEmployees.length} Employees
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
