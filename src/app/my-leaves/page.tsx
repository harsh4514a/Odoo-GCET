'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CalendarDays,
  Plus,
  Loader2,
  CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface LeaveRequest {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  adminComments: string;
  createdAt: string;
}

export default function MyLeavesPage() {
  const { user } = useAuthStore();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [leaveType, setLeaveType] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reason, setReason] = useState('');

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
      console.error('Error fetching leave requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!leaveType || !dateRange?.from || !dateRange?.to || !reason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveType,
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
          reason,
        }),
      });

      if (response.ok) {
        toast.success('Leave request submitted successfully');
        setIsDialogOpen(false);
        setLeaveType('');
        setDateRange(undefined);
        setReason('');
        fetchLeaveRequests();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit leave request');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
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
    return <Badge variant="outline" className={config[type]}>{type}</Badge>;
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
            <h1 className="text-3xl font-bold text-slate-900">My Leaves</h1>
            <p className="text-slate-500 mt-1">Manage your leave requests</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25">
                <Plus className="w-4 h-4 mr-2" />
                Apply for Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>
                  Fill in the details to submit a leave request
                </DialogDescription>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 pt-4"
              >
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">
                        🌴 Paid Leave ({user?.leaveBalance.paid || 0} remaining)
                      </SelectItem>
                      <SelectItem value="Sick">
                        🏥 Sick Leave ({user?.leaveBalance.sick || 0} remaining)
                      </SelectItem>
                      <SelectItem value="Unpaid">📝 Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal rounded-xl',
                          !dateRange && 'text-slate-500'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, 'LLL dd, y')} -{' '}
                              {format(dateRange.to, 'LLL dd, y')}
                            </>
                          ) : (
                            format(dateRange.from, 'LLL dd, y')
                          )
                        ) : (
                          'Select dates'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a detailed reason for your leave request..."
                    className="rounded-xl min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </motion.div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Leave Balance Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Paid Leave Balance</p>
                  <p className="text-3xl font-bold text-green-600">{user?.leaveBalance.paid || 0}</p>
                  <p className="text-xs text-slate-400 mt-1">days remaining</p>
                </div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🌴</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Sick Leave Balance</p>
                  <p className="text-3xl font-bold text-blue-600">{user?.leaveBalance.sick || 0}</p>
                  <p className="text-xs text-slate-400 mt-1">days remaining</p>
                </div>
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🏥</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Pending Requests</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {leaveRequests.filter((l) => l.status === 'Pending').length}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">awaiting approval</p>
                </div>
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leave Requests Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-purple-600" />
                Leave History
              </CardTitle>
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
                        <TableHead>Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                            No leave requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        leaveRequests.map((leave, index) => (
                          <motion.tr
                            key={leave._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="hover:bg-slate-50"
                          >
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
                              {leave.adminComments && (
                                <p className="text-xs text-red-500 mt-1 truncate">
                                  Admin: {leave.adminComments}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(leave.status)}</TableCell>
                            <TableCell className="text-slate-500">
                              {format(new Date(leave.createdAt), 'MMM d, yyyy')}
                            </TableCell>
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
