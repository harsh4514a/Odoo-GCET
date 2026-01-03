import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface ISalaryStructure {
  basicSalary: number;
  hra: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  pfDeduction: number;
  taxDeduction: number;
  otherDeductions: number;
  netSalary: number;
  bankDetails: IBankDetails;
}

export interface IProfile {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  jobTitle: string;
  department: string;
  profilePicture: string;
  documents: string[];
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  employeeId: string;
  email: string;
  password: string;
  role: 'Admin' | 'Employee';
  profile: IProfile;
  salary: ISalaryStructure;
  leaveBalance: {
    paid: number;
    sick: number;
    unpaid: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BankDetailsSchema = new Schema<IBankDetails>(
  {
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
  },
  { _id: false }
);

const SalaryStructureSchema = new Schema<ISalaryStructure>(
  {
    basicSalary: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    transportAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    otherAllowances: { type: Number, default: 0 },
    pfDeduction: { type: Number, default: 0 },
    taxDeduction: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    bankDetails: { type: BankDetailsSchema, default: () => ({}) },
  },
  { _id: false }
);

const ProfileSchema = new Schema<IProfile>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    department: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    documents: [{ type: String }],
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Admin', 'Employee'],
      default: 'Employee',
    },
    profile: {
      type: ProfileSchema,
      required: true,
    },
    salary: {
      type: SalaryStructureSchema,
      default: () => ({
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
      }),
    },
    leaveBalance: {
      paid: { type: Number, default: 12 },
      sick: { type: Number, default: 6 },
      unpaid: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate net salary before saving
UserSchema.pre('save', async function () {
  if (this.salary) {
    const grossSalary = 
      this.salary.basicSalary +
      this.salary.hra +
      this.salary.transportAllowance +
      this.salary.medicalAllowance +
      this.salary.otherAllowances;
    
    const totalDeductions = 
      this.salary.pfDeduction +
      this.salary.taxDeduction +
      this.salary.otherDeductions;
    
    this.salary.netSalary = grossSalary - totalDeductions;
  }
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
