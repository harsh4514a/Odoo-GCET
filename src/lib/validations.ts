import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export const leaveRequestSchema = z.object({
  leaveType: z.enum(['Paid', 'Sick', 'Unpaid']),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)'),
});

export const leaveStatusUpdateSchema = z.object({
  leaveId: z.string(),
  status: z.enum(['Approved', 'Rejected']),
  adminComments: z.string().optional(),
});

export const profileUpdateSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  profilePicture: z.string().url().optional().or(z.literal('')),
});

export const salaryUpdateSchema = z.object({
  userId: z.string(),
  basic: z.number().min(0),
  allowances: z.number().min(0),
  deductions: z.number().min(0),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
export type LeaveStatusUpdateInput = z.infer<typeof leaveStatusUpdateSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type SalaryUpdateInput = z.infer<typeof salaryUpdateSchema>;
