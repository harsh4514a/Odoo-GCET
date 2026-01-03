'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      {user?.role === 'Admin' ? <AdminDashboard /> : <EmployeeDashboard />}
    </DashboardLayout>
  );
}
