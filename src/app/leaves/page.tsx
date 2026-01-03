'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LeaveRequest {
  _id: string;
  user: {
    _id: string;
    employeeId: string;
    profile: {
      firstName: string;
      lastName: string;
      department: string;
      jobTitle: string;
      profilePicture: string;
    };
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  adminComments: string;
  createdAt: string;
}

export default function LeavesPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [adminComment, setAdminComment] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/leaves');
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data.leaveRequests);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (leaveId: string, status: 'Approved' | 'Rejected') => {
    try {
      setProcessingId(leaveId);
      const response = await fetch('/api/leaves/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId,
          status,
          adminComments: adminComment,
        }),
      });

      if (response.ok) {
        toast.success(`Leave request ${status.toLowerCase()}`);
        setSelectedLeave(null);
        setAdminComment('');
        fetchLeaveRequests();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to process request');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const getFilteredRequests = () => {
    let filtered = leaveRequests;

    if (activeTab !== 'all') {
      filtered = filtered.filter((r) => r.status.toLowerCase() === activeTab);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.user.profile.firstName.toLowerCase().includes(query) ||
          r.user.profile.lastName.toLowerCase().includes(query) ||
          r.user.employeeId.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; icon: React.ReactNode }> = {
      Pending: {
        className: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="w-3 h-3 mr-1" />,
      },
      Approved: {
        className: 'bg-green-100 text-green-700',
        icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
      },
      Rejected: {
        className: 'bg-red-100 text-red-700',
        icon: <XCircle className="w-3 h-3 mr-1" />,
      },
    };
    const { className, icon } = config[status] || config.Pending;
    return (
      <Badge className={cn('flex items-center', className)}>
        {icon}
        {status}
      </Badge>
    );
  };

  const getLeaveTypeBadge = (type: string) => {
    const config: Record<string, string> = {
      Paid: 'bg-green-50 text-green-700 border-green-200',
      Sick: 'bg-blue-50 text-blue-700 border-blue-200',
      Unpaid: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return (
      <Badge variant="outline" className={config[type]}>
        {type}
      </Badge>
    );
  };

  const stats = {
    pending: leaveRequests.filter((r) => r.status === 'Pending').length,
    approved: leaveRequests.filter((r) => r.status === 'Approved').length,
    rejected: leaveRequests.filter((r) => r.status === 'Rejected').length,
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
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-slate-900">Leave Management</h1>
          <p className="text-slate-500 mt-1">Review and manage employee leave requests</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-yellow-400 to-orange-400" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-400" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.approved}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-400 to-rose-400" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.rejected}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-purple-600" />
                  Leave Requests
                </CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search employee..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-100 p-1 rounded-xl mb-4">
                  <TabsTrigger value="pending" className="rounded-lg">
                    Pending ({stats.pending})
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="rounded-lg">
                    Approved ({stats.approved})
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="rounded-lg">
                    Rejected ({stats.rejected})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="rounded-lg">
                    All
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
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
                            <TableHead className="font-semibold">Type</TableHead>
                            <TableHead className="font-semibold">Duration</TableHead>
                            <TableHead className="font-semibold">Reason</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredRequests().length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                No leave requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            getFilteredRequests().map((leave, index) => (
                              <motion.tr
                                key={leave._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="hover:bg-slate-50"
                              >
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                      <AvatarImage src={leave.user.profile.profilePicture} />
                                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm">
                                        {leave.user.profile.firstName[0]}
                                        {leave.user.profile.lastName[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-slate-900">
                                        {leave.user.profile.firstName} {leave.user.profile.lastName}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {leave.user.profile.department}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{getLeaveTypeBadge(leave.leaveType)}</TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">
                                      {format(new Date(leave.startDate), 'MMM d')} -{' '}
                                      {format(new Date(leave.endDate), 'MMM d, yyyy')}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {Math.ceil(
                                        (new Date(leave.endDate).getTime() -
                                          new Date(leave.startDate).getTime()) /
                                          (1000 * 60 * 60 * 24)
                                      ) + 1}{' '}
                                      days
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                  <p className="truncate text-slate-600">{leave.reason}</p>
                                </TableCell>
                                <TableCell>{getStatusBadge(leave.status)}</TableCell>
                                <TableCell className="text-right">
                                  {leave.status === 'Pending' ? (
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => setSelectedLeave(leave)}
                                        disabled={processingId === leave._id}
                                        className="bg-green-600 hover:bg-green-700 rounded-lg"
                                      >
                                        {processingId === leave._id ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <>
                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                            Approve
                                          </>
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedLeave(leave);
                                        }}
                                        className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-slate-400">Processed</span>
                                  )}
                                </TableCell>
                              </motion.tr>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Dialog */}
        <Dialog open={!!selectedLeave} onOpenChange={() => setSelectedLeave(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Process Leave Request</DialogTitle>
              <DialogDescription>
                Review and approve or reject this leave request
              </DialogDescription>
            </DialogHeader>

            {selectedLeave && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                      {selectedLeave.user.profile.firstName[0]}
                      {selectedLeave.user.profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedLeave.user.profile.firstName}{' '}
                      {selectedLeave.user.profile.lastName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedLeave.user.profile.department}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500">Leave Type</p>
                    <p className="font-medium">{selectedLeave.leaveType}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500">Duration</p>
                    <p className="font-medium">
                      {Math.ceil(
                        (new Date(selectedLeave.endDate).getTime() -
                          new Date(selectedLeave.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + 1}{' '}
                      days
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Reason</p>
                  <p className="text-slate-700">{selectedLeave.reason}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <p className="text-sm text-slate-600">Add a comment (optional)</p>
                  </div>
                  <Textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Enter any comments for the employee..."
                    className="rounded-xl"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAction(selectedLeave._id, 'Approved')}
                    disabled={processingId === selectedLeave._id}
                    className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
                  >
                    {processingId === selectedLeave._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleAction(selectedLeave._id, 'Rejected')}
                    disabled={processingId === selectedLeave._id}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
