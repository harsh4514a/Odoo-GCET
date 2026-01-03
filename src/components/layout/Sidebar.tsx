'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  DollarSign,
  User,
  LogOut,
  ChevronLeft,
  Sparkles,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/leaves', label: 'Leaves', icon: CalendarDays },
  { href: '/payroll', label: 'Payroll', icon: DollarSign },
];

const employeeLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'My Profile', icon: User },
  { href: '/my-attendance', label: 'My Attendance', icon: CalendarCheck },
  { href: '/my-leaves', label: 'My Leaves', icon: CalendarDays },
  { href: '/my-payroll', label: 'My Payroll', icon: DollarSign },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const links = user?.role === 'Admin' ? adminLinks : employeeLinks;

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-6 border-b border-slate-200",
        isCollapsed && !isMobile && "justify-center px-2"
      )}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
        <AnimatePresence>
          {(!isCollapsed || isMobile) && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-xl font-bold text-slate-900 overflow-hidden whitespace-nowrap"
            >
              Dayflow
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {links.map((link, index) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={link.href}
                onClick={() => isMobile && setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  isCollapsed && !isMobile && "justify-center px-3"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-purple-600"
                )} />
                <AnimatePresence>
                  {(!isCollapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium overflow-hidden whitespace-nowrap"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User section */}
      <div className="mt-auto border-t border-slate-200 p-4">
        <div className={cn(
          "flex items-center gap-3 mb-4",
          isCollapsed && !isMobile && "justify-center"
        )}>
          <Avatar className="w-10 h-10 border-2 border-purple-200">
            <AvatarImage src={user?.profile.profilePicture} />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
              {user?.profile.firstName?.[0]}{user?.profile.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {(!isCollapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <p className="font-semibold text-slate-900 text-sm truncate">
                  {user?.profile.firstName} {user?.profile.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50",
            isCollapsed && !isMobile && "justify-center px-3"
          )}
        >
          <LogOut className="w-5 h-5" />
          <AnimatePresence>
            {(!isCollapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>

      {/* Collapse button - desktop only */}
      {!isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </motion.div>
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">Dayflow</span>
        </div>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200 z-50"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
