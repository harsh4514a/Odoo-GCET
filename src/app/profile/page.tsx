'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
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
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    profilePicture: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.profile.phone || '',
        address: user.profile.address || '',
        profilePicture: user.profile.profilePicture || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.user);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
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

  if (!user) return null;

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-500 mt-1">Manage your personal information</p>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
                    phone: user.profile.phone || '',
                    address: user.profile.address || '',
                    profilePicture: user.profile.profilePicture || '',
                  });
                }}
                className="rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="rounded-xl bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600" />

            <CardContent className="relative pt-0 pb-6 px-6">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={user.profile.profilePicture} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-4xl font-bold">
                    {user.profile.firstName[0]}
                    {user.profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center sm:text-left pb-4">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {user.profile.firstName} {user.profile.lastName}
                  </h2>
                  <p className="text-slate-500">{user.profile.jobTitle}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                    <Badge className="bg-purple-100 text-purple-700">{user.role}</Badge>
                    <Badge variant="outline">{user.profile.department}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-purple-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <IdCard className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Employee ID</p>
                    <p className="font-medium text-slate-900">{user.employeeId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <Mail className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Email Address</p>
                    <p className="font-medium text-slate-900">{user.email}</p>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-10 rounded-xl"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                    <Phone className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">Phone Number</p>
                      <p className="font-medium text-slate-900">
                        {user.profile.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                )}

                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="pl-10 rounded-xl min-h-[80px]"
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Address</p>
                      <p className="font-medium text-slate-900">
                        {user.profile.address || 'Not provided'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Information */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Job Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <Briefcase className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Job Title</p>
                    <p className="font-medium text-slate-900">{user.profile.jobTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <Building className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Department</p>
                    <p className="font-medium text-slate-900">{user.profile.department}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="text-sm text-slate-500 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <p className="font-medium text-amber-700">Note</p>
                  <p className="text-amber-600 mt-1">
                    Job title and department can only be changed by an administrator.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Salary Information */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
                Salary Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-600 mb-1">Basic Salary</p>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{user.salary.basicSalary.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-600 mb-1">Total Allowances</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ₹{(user.salary.hra + user.salary.transportAllowance + user.salary.medicalAllowance + user.salary.otherAllowances).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <p className="text-sm text-red-600 mb-1">Total Deductions</p>
                  <p className="text-2xl font-bold text-red-700">
                    ₹{(user.salary.pfDeduction + user.salary.taxDeduction + user.salary.otherDeductions).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <p className="text-sm text-purple-600 mb-1">Net Salary</p>
                  <p className="text-2xl font-bold text-purple-700">
                    ₹{user.salary.netSalary.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
