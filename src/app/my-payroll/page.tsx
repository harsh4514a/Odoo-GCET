'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Building2,
  CreditCard,
  Receipt,
  Calendar,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MyPayrollPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPayslip = async () => {
    if (!user) return;
    
    setIsDownloading(true);
    
    try {
      const salary = user.salary;
      const currentMonth = format(new Date(), 'MMMM yyyy');
      const grossSalary = salary.basicSalary + salary.hra + salary.transportAllowance + salary.medicalAllowance + salary.otherAllowances;
      const totalDeductions = salary.taxDeduction + salary.pfDeduction + salary.otherDeductions;

      // Create payslip HTML content
      const payslipContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Payslip - ${currentMonth}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #fff; color: #1e293b; }
            .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #7c3aed; }
            .company-name { font-size: 28px; font-weight: bold; color: #7c3aed; margin-bottom: 5px; }
            .payslip-title { font-size: 16px; color: #64748b; }
            .payslip-month { font-size: 18px; font-weight: 600; color: #1e293b; margin-top: 10px; }
            .employee-info { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; }
            .info-group { }
            .info-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
            .info-value { font-size: 14px; font-weight: 600; color: #1e293b; }
            .salary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .salary-table th { background: #7c3aed; color: white; padding: 12px; text-align: left; font-size: 14px; }
            .salary-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .salary-table tr:last-child td { border-bottom: none; }
            .amount { text-align: right; font-weight: 600; }
            .section-title { font-size: 16px; font-weight: 600; margin: 20px 0 10px 0; color: #1e293b; }
            .totals { display: flex; justify-content: space-between; padding: 20px; background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); border-radius: 8px; color: white; margin-top: 30px; }
            .total-item { text-align: center; }
            .total-label { font-size: 12px; opacity: 0.9; margin-bottom: 4px; }
            .total-value { font-size: 24px; font-weight: bold; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">✨ Dayflow</div>
            <div class="payslip-title">Employee Payslip</div>
            <div class="payslip-month">${currentMonth}</div>
          </div>
          
          <div class="employee-info">
            <div class="info-group">
              <div class="info-label">Employee Name</div>
              <div class="info-value">${user.profile.firstName} ${user.profile.lastName}</div>
            </div>
            <div class="info-group">
              <div class="info-label">Employee ID</div>
              <div class="info-value">${user.employeeId}</div>
            </div>
            <div class="info-group">
              <div class="info-label">Department</div>
              <div class="info-value">${user.profile.department}</div>
            </div>
            <div class="info-group">
              <div class="info-label">Designation</div>
              <div class="info-value">${user.profile.jobTitle}</div>
            </div>
          </div>

          <div class="section-title">💰 Earnings</div>
          <table class="salary-table">
            <tr><th>Component</th><th style="text-align: right;">Amount (₹)</th></tr>
            <tr><td>Basic Salary</td><td class="amount">${salary.basicSalary.toLocaleString('en-IN')}</td></tr>
            <tr><td>House Rent Allowance (HRA)</td><td class="amount">${salary.hra.toLocaleString('en-IN')}</td></tr>
            <tr><td>Transport Allowance</td><td class="amount">${salary.transportAllowance.toLocaleString('en-IN')}</td></tr>
            <tr><td>Medical Allowance</td><td class="amount">${salary.medicalAllowance.toLocaleString('en-IN')}</td></tr>
            <tr><td>Other Allowances</td><td class="amount">${salary.otherAllowances.toLocaleString('en-IN')}</td></tr>
            <tr style="background: #f0fdf4;"><td><strong>Gross Salary</strong></td><td class="amount"><strong>${grossSalary.toLocaleString('en-IN')}</strong></td></tr>
          </table>

          <div class="section-title">📉 Deductions</div>
          <table class="salary-table">
            <tr><th>Component</th><th style="text-align: right;">Amount (₹)</th></tr>
            <tr><td>Income Tax (TDS)</td><td class="amount">${salary.taxDeduction.toLocaleString('en-IN')}</td></tr>
            <tr><td>Provident Fund (PF)</td><td class="amount">${salary.pfDeduction.toLocaleString('en-IN')}</td></tr>
            <tr><td>Other Deductions</td><td class="amount">${salary.otherDeductions.toLocaleString('en-IN')}</td></tr>
            <tr style="background: #fef2f2;"><td><strong>Total Deductions</strong></td><td class="amount"><strong>${totalDeductions.toLocaleString('en-IN')}</strong></td></tr>
          </table>

          <div class="totals">
            <div class="total-item">
              <div class="total-label">Gross Earnings</div>
              <div class="total-value">₹${grossSalary.toLocaleString('en-IN')}</div>
            </div>
            <div class="total-item">
              <div class="total-label">Total Deductions</div>
              <div class="total-value">₹${totalDeductions.toLocaleString('en-IN')}</div>
            </div>
            <div class="total-item">
              <div class="total-label">Net Payable</div>
              <div class="total-value">₹${salary.netSalary.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div class="footer">
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <p style="margin-top: 5px;">Generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')}</p>
          </div>
        </body>
        </html>
      `;

      // Create a Blob with the HTML content
      const blob = new Blob([payslipContent], { type: 'text/html' });
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(payslipContent);
        printWindow.document.close();
        
        // Wait for content to load then trigger print
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Error generating payslip:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

  const salary = user.salary;
  const currentMonth = format(new Date(), 'MMMM yyyy');

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
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
        <motion.div variants={itemVariants} className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Payroll</h1>
            <p className="text-slate-500 mt-1">View your salary details and payslips</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl"
            onClick={downloadPayslip}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isDownloading ? 'Generating...' : 'Download Payslip'}
          </Button>
        </motion.div>

        {/* Salary Overview Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-400" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Net Salary</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatCurrency(salary.netSalary)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">Monthly Take Home</p>
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
                  <p className="text-sm text-slate-500 mb-1">Gross Salary</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatCurrency(
                      salary.basicSalary +
                        salary.hra +
                        salary.transportAllowance +
                        salary.medicalAllowance +
                        salary.otherAllowances
                    )}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Before Deductions</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Annual CTC</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatCurrency(salary.netSalary * 12)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Yearly Package</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-slate-900">Basic Salary</p>
                      <p className="text-xs text-slate-500">Foundation of your salary</p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(salary.basicSalary)}
                    </p>
                  </div>
                  <Separator />

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-slate-900">HRA</p>
                      <p className="text-xs text-slate-500">House Rent Allowance</p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(salary.hra)}
                    </p>
                  </div>
                  <Separator />

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-slate-900">Transport Allowance</p>
                      <p className="text-xs text-slate-500">Commute expenses</p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(salary.transportAllowance)}
                    </p>
                  </div>
                  <Separator />

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-slate-900">Medical Allowance</p>
                      <p className="text-xs text-slate-500">Health benefits</p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(salary.medicalAllowance)}
                    </p>
                  </div>
                  <Separator />

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-slate-900">Other Allowances</p>
                      <p className="text-xs text-slate-500">Additional benefits</p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(salary.otherAllowances)}
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-xl mt-4">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-green-700">Total Earnings</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(
                        salary.basicSalary +
                          salary.hra +
                          salary.transportAllowance +
                          salary.medicalAllowance +
                          salary.otherAllowances
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Deductions */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-red-600" />
                  </div>
                  Deductions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-slate-900">Provident Fund (PF)</p>
                      <p className="text-xs text-slate-500">Retirement savings</p>
                    </div>
                    <p className="font-semibold text-red-600">
                      - {formatCurrency(salary.pfDeduction)}
                    </p>
                  </div>
                  <Separator />

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-slate-900">Tax (TDS)</p>
                      <p className="text-xs text-slate-500">Tax deducted at source</p>
                    </div>
                    <p className="font-semibold text-red-600">
                      - {formatCurrency(salary.taxDeduction)}
                    </p>
                  </div>
                  <Separator />

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-slate-900">Other Deductions</p>
                      <p className="text-xs text-slate-500">Insurance, loans etc.</p>
                    </div>
                    <p className="font-semibold text-red-600">
                      - {formatCurrency(salary.otherDeductions)}
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-xl mt-4">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-red-700">Total Deductions</p>
                    <p className="text-xl font-bold text-red-700">
                      - {formatCurrency(
                        salary.pfDeduction + salary.taxDeduction + salary.otherDeductions
                      )}
                    </p>
                  </div>
                </div>

                {/* Net Pay Summary */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-5 rounded-xl text-white mt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-purple-200 text-sm">Net Pay for {currentMonth}</p>
                      <p className="text-3xl font-bold mt-1">
                        {formatCurrency(salary.netSalary)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bank Details */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Bank Account Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Bank Name</p>
                  <p className="font-semibold text-slate-900">
                    {salary.bankDetails?.bankName || 'Not Provided'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Account Number</p>
                  <p className="font-semibold text-slate-900">
                    {salary.bankDetails?.accountNumber
                      ? `****${salary.bankDetails.accountNumber.slice(-4)}`
                      : 'Not Provided'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">IFSC Code</p>
                  <p className="font-semibold text-slate-900">
                    {salary.bankDetails?.ifscCode || 'Not Provided'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Payslips */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Recent Payslips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[0, 1, 2].map((monthsAgo) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - monthsAgo);
                  const monthYear = format(date, 'MMMM yyyy');
                  return (
                    <motion.div
                      key={monthsAgo}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: monthsAgo * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{monthYear}</p>
                          <p className="text-sm text-slate-500">Monthly Salary</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            {formatCurrency(salary.netSalary)}
                          </p>
                          <Badge className="bg-green-100 text-green-700">Paid</Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-lg"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
