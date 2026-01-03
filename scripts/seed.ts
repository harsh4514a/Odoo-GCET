import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dayflow';

// Import models using src alias
import User from '../src/models/User';
import Attendance from '../src/models/Attendance';
import LeaveRequest from '../src/models/LeaveRequest';

const departments = ['Engineering', 'Marketing', 'Human Resources', 'Finance', 'Operations'];
const jobTitles = [
  'Software Engineer',
  'Marketing Manager',
  'HR Specialist',
  'Financial Analyst',
  'Operations Lead',
  'Senior Developer',
  'Product Manager',
];

const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Ashley'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

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

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await LeaveRequest.deleteMany({});
    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Admin user
    const admin = await User.create({
      employeeId: 'EMP001',
      email: 'admin@dayflow.com',
      password: hashedPassword,
      role: 'Admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1 (555) 000-0001',
        address: '123 Admin Street, Tech City, TC 12345',
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
    console.log('Created Admin user:', admin.email);

    // Create 5 Employee users
    const employees = [];
    for (let i = 0; i < 5; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const department = departments[i % departments.length];
      const jobTitle = jobTitles[i % jobTitles.length];
      const basicSalary = 50000 + i * 8000;

      const employee = await User.create({
        employeeId: `EMP${String(i + 2).padStart(3, '0')}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@dayflow.com`,
        password: hashedPassword,
        role: 'Employee',
        profile: {
          firstName,
          lastName,
          phone: `+1 (555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i * 111).slice(0, 4)}`,
          address: `${100 + i * 10} Employee Ave, Work City, WC ${10000 + i}`,
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
          netSalary: 0, // Will be calculated
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
      console.log(`Created Employee: ${employee.email}`);
    }

    const allUsers = [admin, ...employees];

    // Generate 30 days of attendance data for all users
    const today = new Date();
    const attendanceRecords = [];

    for (const user of allUsers) {
      for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);
        const normalizedDate = normalizeToMidnight(date);

        if (isWeekend(normalizedDate)) {
          // Weekend - mark as Weekend
          attendanceRecords.push({
            user: user._id,
            date: normalizedDate,
            checkInTime: null,
            checkOutTime: null,
            status: 'Weekend',
            workHours: 0,
          });
        } else {
          // Weekday - generate random attendance
          const random = Math.random();

          if (random < 0.85) {
            // 85% chance of being present
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
            // 10% chance of leave
            attendanceRecords.push({
              user: user._id,
              date: normalizedDate,
              checkInTime: null,
              checkOutTime: null,
              status: 'Leave',
              workHours: 0,
            });
          } else {
            // 5% chance of absent
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
    console.log(`Created ${attendanceRecords.length} attendance records`);

    // Generate leave requests
    const leaveTypes: Array<'Paid' | 'Sick' | 'Unpaid'> = ['Paid', 'Sick', 'Unpaid'];
    const statuses: Array<'Pending' | 'Approved' | 'Rejected'> = ['Pending', 'Approved', 'Rejected'];
    const reasons = [
      'Family emergency',
      'Medical appointment',
      'Personal matters',
      'Vacation',
      'Not feeling well',
      'Family event',
      'Home repairs',
    ];

    const leaveRequests = [];

    for (const employee of employees) {
      // Generate 2-4 leave requests per employee
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
          adminComments: status === 'Rejected' ? 'Unable to approve at this time due to project deadlines.' : '',
        });
      }
    }

    await LeaveRequest.insertMany(leaveRequests);
    console.log(`Created ${leaveRequests.length} leave requests`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@dayflow.com / password123');
    console.log('Employee: Check any created employee email / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
