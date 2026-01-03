import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import LeaveRequest from '@/models/LeaveRequest';

const departments = ['Engineering', 'Marketing', 'Human Resources', 'Finance', 'Operations'];
const jobTitles = [
  'Software Engineer',
  'Marketing Manager',
  'HR Specialist',
  'Financial Analyst',
  'Operations Lead',
];

// Indian names
const firstNames = ['Aarav', 'Priya', 'Vihaan', 'Ananya', 'Arjun'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Singh'];

// Indian cities
const indianCities = [
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { city: 'Delhi', state: 'Delhi', pincode: '110001' },
  { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
];

const banks = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function normalizeToMidnight(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export async function GET() {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await LeaveRequest.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Admin user
    const admin = await User.create({
      employeeId: 'EMP001',
      email: 'admin@dayflow.com',
      password: hashedPassword,
      role: 'Admin',
      profile: {
        firstName: 'Rajesh',
        lastName: 'Sharma',
        phone: '+91 98765 43210',
        address: '123 MG Road, Connaught Place, New Delhi, Delhi 110001',
        jobTitle: 'System Administrator',
        department: 'Administration',
        profilePicture: '',
        documents: [],
      },
      salary: {
        basicSalary: 80000,
        hra: 32000,
        transportAllowance: 8000,
        medicalAllowance: 4000,
        otherAllowances: 6000,
        pfDeduction: 9600,
        taxDeduction: 15000,
        otherDeductions: 0,
        netSalary: 105400,
        bankDetails: {
          bankName: 'HDFC Bank',
          accountNumber: '50100012345678',
          ifscCode: 'HDFC0001234',
        },
      },
      leaveBalance: {
        paid: 15,
        sick: 10,
        unpaid: 0,
      },
    });

    // Create 5 Employee users
    const employees = [];
    for (let i = 0; i < 5; i++) {
      const firstName = firstNames[i];
      const lastName = lastNames[i];
      const department = departments[i];
      const jobTitle = jobTitles[i];
      const basicSalary = 50000 + i * 8000;
      const cityInfo = indianCities[i];

      const employee = await User.create({
        employeeId: `EMP${String(i + 2).padStart(3, '0')}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@dayflow.com`,
        password: hashedPassword,
        role: 'Employee',
        profile: {
          firstName,
          lastName,
          phone: `+91 ${97000 + Math.floor(Math.random() * 2000)} ${10000 + Math.floor(Math.random() * 89999)}`,
          address: `${100 + i * 10} ${['Sector', 'Block', 'Lane', 'Colony', 'Nagar'][i]} ${i + 1}, ${cityInfo.city}, ${cityInfo.state} ${cityInfo.pincode}`,
          jobTitle,
          department,
          profilePicture: '',
          documents: [],
        },
        salary: {
          basicSalary,
          hra: Math.round(basicSalary * 0.4),
          transportAllowance: 5000,
          medicalAllowance: 2500,
          otherAllowances: 2500 + i * 500,
          pfDeduction: Math.round(basicSalary * 0.12),
          taxDeduction: Math.round(basicSalary * 0.1),
          otherDeductions: 0,
          netSalary: 0,
          bankDetails: {
            bankName: getRandomElement(banks),
            accountNumber: `${50100000000000 + Math.floor(Math.random() * 100000000)}`,
            ifscCode: `${getRandomElement(banks).substring(0, 4).toUpperCase()}000${1000 + i}`,
          },
        },
        leaveBalance: {
          paid: 12 - Math.floor(Math.random() * 3),
          sick: 6 - Math.floor(Math.random() * 2),
          unpaid: 0,
        },
      });
      employees.push(employee);
    }

    const allUsers = [admin, ...employees];

    // Generate 30 days of attendance data
    const today = new Date();
    const attendanceRecords = [];

    for (const user of allUsers) {
      for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);
        const normalizedDate = normalizeToMidnight(date);

        if (isWeekend(normalizedDate)) {
          attendanceRecords.push({
            user: user._id,
            date: normalizedDate,
            checkInTime: null,
            checkOutTime: null,
            status: 'Weekend',
            workHours: 0,
          });
        } else {
          const random = Math.random();

          if (random < 0.85) {
            const checkIn = new Date(normalizedDate);
            checkIn.setHours(8, 50 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 60));

            const checkOut = new Date(normalizedDate);
            checkOut.setHours(17, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));

            const workHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

            attendanceRecords.push({
              user: user._id,
              date: normalizedDate,
              checkInTime: checkIn,
              checkOutTime: checkOut,
              status: workHours >= 8 ? 'Present' : 'Half-day',
              workHours: Math.round(workHours * 100) / 100,
            });
          } else if (random < 0.95) {
            attendanceRecords.push({
              user: user._id,
              date: normalizedDate,
              checkInTime: null,
              checkOutTime: null,
              status: 'Leave',
              workHours: 0,
            });
          } else {
            attendanceRecords.push({
              user: user._id,
              date: normalizedDate,
              checkInTime: null,
              checkOutTime: null,
              status: 'Absent',
              workHours: 0,
            });
          }
        }
      }
    }

    await Attendance.insertMany(attendanceRecords);

    // Generate leave requests
    const leaveTypes: Array<'Paid' | 'Sick' | 'Unpaid'> = ['Paid', 'Sick', 'Unpaid'];
    const statuses: Array<'Pending' | 'Approved' | 'Rejected'> = ['Pending', 'Approved', 'Rejected'];
    const reasons = [
      'Family emergency',
      'Medical appointment',
      'Personal matters',
      'Vacation',
      'Not feeling well',
    ];

    const leaveRequests = [];

    for (const employee of employees) {
      const numRequests = 2 + Math.floor(Math.random() * 3);

      for (let i = 0; i < numRequests; i++) {
        const startOffset = Math.floor(Math.random() * 60) - 30;
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() + startOffset);
        const normalizedStart = normalizeToMidnight(startDate);

        const duration = 1 + Math.floor(Math.random() * 3);
        const endDate = new Date(normalizedStart);
        endDate.setDate(endDate.getDate() + duration - 1);

        const status = getRandomElement(statuses);

        leaveRequests.push({
          user: employee._id,
          leaveType: getRandomElement(leaveTypes),
          startDate: normalizedStart,
          endDate,
          reason: getRandomElement(reasons),
          status,
          adminComments: status === 'Rejected' ? 'Unable to approve at this time.' : '',
        });
      }
    }

    await LeaveRequest.insertMany(leaveRequests);

    return NextResponse.json({
      message: 'Database seeded successfully!',
      data: {
        users: allUsers.length,
        attendance: attendanceRecords.length,
        leaveRequests: leaveRequests.length,
      },
      credentials: {
        admin: {
          email: 'admin@dayflow.com',
          password: 'password123',
        },
        employees: employees.map((e) => ({
          email: e.email,
          password: 'password123',
        })),
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
