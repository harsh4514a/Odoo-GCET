import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'dayflow-secret-key-change-in-production';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'Admin' | 'Employee';
  employeeId: string;
}

export function generateToken(user: IUser): string {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

export function isAdmin(user: TokenPayload | null): boolean {
  return user?.role === 'Admin';
}
