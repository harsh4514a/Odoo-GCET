import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { employeeId, email, password, firstName, lastName } = validatedData.data;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { employeeId }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or employee ID already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      employeeId,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'Employee',
      profile: {
        firstName,
        lastName,
        phone: '',
        address: '',
        jobTitle: 'New Employee',
        department: 'Unassigned',
        profilePicture: '',
        documents: [],
      },
      salary: {
        basicSalary: 50000,
        hra: 20000,
        transportAllowance: 5000,
        medicalAllowance: 2500,
        otherAllowances: 2500,
        pfDeduction: 6000,
        taxDeduction: 8000,
        otherDeductions: 0,
        netSalary: 66000,
        bankDetails: {
          bankName: '',
          accountNumber: '',
          ifscCode: '',
        },
      },
      leaveBalance: {
        paid: 12,
        sick: 6,
        unpaid: 0,
      },
    });

    // Generate JWT token
    const token = generateToken(user);

    // Create response with token in cookie
    const response = NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
