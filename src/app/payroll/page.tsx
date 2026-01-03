'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Wallet,
  DollarSign,
  Users,
  Search,
  Loader2,
  Edit,
  Save,
  X,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Employee {
  _id: string;
  employeeId: string;
  profile: {
    firstName: string;
    lastName: string;
    department: string;
    jobTitle: string;
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
    bankDetails: {
      bankName: string;
      accountNumber: string;
      ifscCode: string;
    };
  };
}

interface EditSalaryForm {
  basicSalary: number;
  hra: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  pfDeduction: number;
  taxDeduction: number;
  otherDeductions: number;
}

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditSalaryForm>({
    basicSalary: 0,
    hra: 0,
    transportAllowance: 0,
    medicalAllowance: 0,
    otherAllowances: 0,
    pfDeduction: 0,
    taxDeduction: 0,
    otherDeductions: 0,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        // Filter only employees (not admins)
        const employeeList = data.employees.filter(
          (emp: Employee & { role: string }) => emp.role === 'Employee'
        );
        setEmployees(employeeList);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditForm({
      basicSalary: employee.salary.basicSalary,
      hra: employee.salary.hra,
      transportAllowance: employee.salary.transportAllowance,
      medicalAllowance: employee.salary.medicalAllowance,
      otherAllowances: employee.salary.otherAllowances,
      pfDeduction: employee.salary.pfDeduction,
      taxDeduction: employee.salary.taxDeduction,
      otherDeductions: employee.salary.otherDeductions,
    });
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/payroll', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee._id,
          salary: editForm,
        }),
      });

      if (response.ok) {
        toast.success('Salary updated successfully');
        setSelectedEmployee(null);
        fetchEmployees();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update salary');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getFilteredEmployees = () => {
    if (!searchQuery) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.profile.firstName.toLowerCase().includes(query) ||
        emp.profile.lastName.toLowerCase().includes(query) ||
        emp.employeeId.toLowerCase().includes(query) ||
        emp.profile.department.toLowerCase().includes(query)
    );
  };

  const calculateGross = (salary: Employee['salary']) => {
    return (
      salary.basicSalary +
      salary.hra +
      salary.transportAllowance +
      salary.medicalAllowance +
      salary.otherAllowances
    );
  };

  const calculateDeductions = (salary: Employee['salary']) => {
    return salary.pfDeduction + salary.taxDeduction + salary.otherDeductions;
  };

  const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary.netSalary, 0);
  const avgSalary = employees.length > 0 ? totalPayroll / employees.length : 0;

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
          <h1 className="text-3xl font-bold text-slate-900">Payroll Management</h1>
          <p className="text-slate-500 mt-1">Manage employee salaries and compensation</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-400" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Payroll</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(totalPayroll)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Average Salary</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(avgSalary)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Annual Payroll</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(totalPayroll * 12)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-orange-400 to-red-400" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Employees</p>
                  <p className="text-2xl font-bold text-slate-900">{employees.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Employee Salary Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Employee Salaries
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
                        <TableHead className="font-semibold">Department</TableHead>
                        <TableHead className="font-semibold text-right">Gross</TableHead>
                        <TableHead className="font-semibold text-right">Deductions</TableHead>
                        <TableHead className="font-semibold text-right">Net Salary</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredEmployees().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                            No employees found
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFilteredEmployees().map((employee, index) => (
                          <motion.tr
                            key={employee._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="hover:bg-slate-50"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={employee.profile.profilePicture} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm">
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
                              <Badge variant="outline" className="rounded-lg">
                                {employee.profile.department}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(calculateGross(employee.salary))}
                            </TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              -{formatCurrency(calculateDeductions(employee.salary))}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-bold text-green-600">
                                {formatCurrency(employee.salary.netSalary)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(employee)}
                                className="rounded-lg"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
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

        {/* Edit Salary Dialog */}
        <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Salary Structure</DialogTitle>
              <DialogDescription>
                Update salary components for this employee
              </DialogDescription>
            </DialogHeader>

            {selectedEmployee && (
              <div className="space-y-6 pt-4">
                {/* Employee Info */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                      {selectedEmployee.profile.firstName[0]}
                      {selectedEmployee.profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedEmployee.profile.firstName}{' '}
                      {selectedEmployee.profile.lastName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedEmployee.profile.department} •{' '}
                      {selectedEmployee.profile.jobTitle}
                    </p>
                  </div>
                </div>

                {/* Earnings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    </div>
                    <p className="font-semibold text-slate-900">Earnings</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Basic Salary</Label>
                      <Input
                        type="number"
                        value={editForm.basicSalary}
                        onChange={(e) =>
                          setEditForm({ ...editForm, basicSalary: Number(e.target.value) })
                        }
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>HRA</Label>
                      <Input
                        type="number"
                        value={editForm.hra}
                        onChange={(e) =>
                          setEditForm({ ...editForm, hra: Number(e.target.value) })
                        }
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Transport Allowance</Label>
                      <Input
                        type="number"
                        value={editForm.transportAllowance}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            transportAllowance: Number(e.target.value),
                          })
                        }
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Medical Allowance</Label>
                      <Input
                        type="number"
                        value={editForm.medicalAllowance}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            medicalAllowance: Number(e.target.value),
                          })
                        }
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Other Allowances</Label>
                      <Input
                        type="number"
                        value={editForm.otherAllowances}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            otherAllowances: Number(e.target.value),
                          })
                        }
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                      <Building2 className="w-3 h-3 text-red-600" />
                    </div>
                    <p className="font-semibold text-slate-900">Deductions</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>PF Deduction</Label>
                      <Input
                        type="number"
                        value={editForm.pfDeduction}
                        onChange={(e) =>
                          setEditForm({ ...editForm, pfDeduction: Number(e.target.value) })
                        }
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax (TDS)</Label>
                      <Input
                        type="number"
                        value={editForm.taxDeduction}
                        onChange={(e) =>
                          setEditForm({ ...editForm, taxDeduction: Number(e.target.value) })
                        }
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Other Deductions</Label>
                      <Input
                        type="number"
                        value={editForm.otherDeductions}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            otherDeductions: Number(e.target.value),
                          })
                        }
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Salary Preview */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-5 rounded-xl text-white">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-purple-200 text-sm">Gross</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(
                          editForm.basicSalary +
                            editForm.hra +
                            editForm.transportAllowance +
                            editForm.medicalAllowance +
                            editForm.otherAllowances
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-purple-200 text-sm">Deductions</p>
                      <p className="text-xl font-bold">
                        -{formatCurrency(
                          editForm.pfDeduction +
                            editForm.taxDeduction +
                            editForm.otherDeductions
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-purple-200 text-sm">Net Salary</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(
                          editForm.basicSalary +
                            editForm.hra +
                            editForm.transportAllowance +
                            editForm.medicalAllowance +
                            editForm.otherAllowances -
                            editForm.pfDeduction -
                            editForm.taxDeduction -
                            editForm.otherDeductions
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedEmployee(null)}
                    className="rounded-xl"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
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
