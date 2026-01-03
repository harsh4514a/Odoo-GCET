'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  IdCard,
  Edit2,
  Save,
  X,
  Loader2,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Employee {
  _id: string;
  employeeId: string;
  email: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    jobTitle: string;
    department: string;
    profilePicture: string;
  };
  salary: {
    basicSalary: number;
    hra: number;
    transportAllowance: number;
    medicalAllowance: number;
    otherAllowances: number;
    pfDeduction: number;
    taxDeduction: number;
    otherDeductions: number;
    netSalary: number;
  };
  leaveBalance: {
    paid: number;
    sick: number;
    unpaid: number;
  };
  createdAt: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  workHours: number;
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    jobTitle: '',
    department: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchEmployeeData();
    }
  }, [params.id]);

  const fetchEmployeeData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, attendanceRes] = await Promise.all([
        fetch(`/api/profile?userId=${params.id}`),
        fetch(`/api/attendance/mark?userId=${params.id}`),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setEmployee(data.user);
        setFormData({
          firstName: data.user.profile.firstName,
          lastName: data.user.profile.lastName,
          phone: data.user.profile.phone,
          address: data.user.profile.address,
          jobTitle: data.user.profile.jobTitle,
          department: data.user.profile.department,
        });
      }

      if (attendanceRes.ok) {
        const data = await attendanceRes.json();
        setAttendance(data.attendance?.slice(0, 10) || []);
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: params.id,
          profile: formData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEmployee(data.user);
        setIsEditing(false);
        toast.success('Employee profile updated');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-500">Employee not found</p>
          <Link href="/employees">
            <Button className="mt-4">Back to Employees</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Employee Profile</h1>
              <p className="text-slate-500 mt-1">View and manage employee details</p>
            </div>
          </div>

          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: employee.profile.firstName,
                    lastName: employee.profile.lastName,
                    phone: employee.profile.phone,
                    address: employee.profile.address,
                    jobTitle: employee.profile.jobTitle,
                    department: employee.profile.department,
                  });
                }}
                className="rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-xl bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600" />
          <CardContent className="relative pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                <AvatarImage src={employee.profile.profilePicture} />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-4xl font-bold">
                  {employee.profile.firstName[0]}
                  {employee.profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left pb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  {employee.profile.firstName} {employee.profile.lastName}
                </h2>
                <p className="text-slate-500">{employee.profile.jobTitle}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  <Badge className="bg-purple-100 text-purple-700">{employee.employeeId}</Badge>
                  <Badge variant="outline">{employee.profile.department}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="info" className="rounded-lg">
              <User className="w-4 h-4 mr-2" />
              Information
            </TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-lg">
              <Calendar className="w-4 h-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="salary" className="rounded-lg">
              <DollarSign className="w-4 h-4 mr-2" />
              Salary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-purple-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({ ...formData, firstName: e.target.value })
                            }
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({ ...formData, lastName: e.target.value })
                            }
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                        <IdCard className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Employee ID</p>
                          <p className="font-medium">{employee.employeeId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                        <Mail className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Email</p>
                          <p className="font-medium">{employee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                        <Phone className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Phone</p>
                          <p className="font-medium">{employee.profile.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl">
                        <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Address</p>
                          <p className="font-medium">
                            {employee.profile.address || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    Job Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input
                          value={formData.jobTitle}
                          onChange={(e) =>
                            setFormData({ ...formData, jobTitle: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Input
                          value={formData.department}
                          onChange={(e) =>
                            setFormData({ ...formData, department: e.target.value })
                          }
                          className="rounded-xl"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                        <Briefcase className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Job Title</p>
                          <p className="font-medium">{employee.profile.jobTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                        <Building className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Department</p>
                          <p className="font-medium">{employee.profile.department}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div>
                    <p className="text-sm text-slate-500 mb-3">Leave Balance</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <p className="text-2xl font-bold text-green-600">
                          {employee.leaveBalance.paid}
                        </p>
                        <p className="text-xs text-green-600">Paid</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <p className="text-2xl font-bold text-blue-600">
                          {employee.leaveBalance.sick}
                        </p>
                        <p className="text-xs text-blue-600">Sick</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-xl">
                        <p className="text-2xl font-bold text-slate-600">∞</p>
                        <p className="text-xs text-slate-600">Unpaid</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent>
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
                            No attendance records
                          </TableCell>
                        </TableRow>
                      ) : (
                        attendance.map((record) => (
                          <TableRow key={record._id}>
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
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salary">
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Salary Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Earnings */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Earnings</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-600 mb-1">Basic Salary</p>
                      <p className="text-xl font-bold text-green-700">
                        ₹{employee.salary?.basicSalary?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-600 mb-1">HRA</p>
                      <p className="text-xl font-bold text-green-700">
                        ₹{employee.salary?.hra?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-600 mb-1">Transport</p>
                      <p className="text-xl font-bold text-green-700">
                        ₹{employee.salary?.transportAllowance?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-600 mb-1">Medical</p>
                      <p className="text-xl font-bold text-green-700">
                        ₹{employee.salary?.medicalAllowance?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-600 mb-1">Other Allowances</p>
                      <p className="text-xl font-bold text-green-700">
                        ₹{employee.salary?.otherAllowances?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Deductions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-red-50 rounded-xl">
                      <p className="text-sm text-red-600 mb-1">PF Deduction</p>
                      <p className="text-xl font-bold text-red-700">
                        ₹{employee.salary?.pfDeduction?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl">
                      <p className="text-sm text-red-600 mb-1">Tax (TDS)</p>
                      <p className="text-xl font-bold text-red-700">
                        ₹{employee.salary?.taxDeduction?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl">
                      <p className="text-sm text-red-600 mb-1">Other Deductions</p>
                      <p className="text-xl font-bold text-red-700">
                        ₹{employee.salary?.otherDeductions?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 mb-1">Net Salary (Monthly)</p>
                      <p className="text-3xl font-bold text-purple-700">
                        ₹{employee.salary?.netSalary?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600 mb-1">Annual CTC</p>
                      <p className="text-xl font-bold text-blue-700">
                        ₹{((employee.salary?.netSalary || 0) * 12).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
