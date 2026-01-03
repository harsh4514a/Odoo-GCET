import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  date: Date;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  status: 'Present' | 'Absent' | 'Half-day' | 'Leave' | 'Weekend';
  workHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half-day', 'Leave', 'Weekend'],
      default: 'Absent',
    },
    workHours: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and date to ensure uniqueness
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// Calculate work hours before saving
AttendanceSchema.pre('save', async function () {
  if (this.checkInTime && this.checkOutTime) {
    const diffMs = this.checkOutTime.getTime() - this.checkInTime.getTime();
    this.workHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    
    // Determine status based on work hours
    if (this.workHours >= 8) {
      this.status = 'Present';
    } else if (this.workHours >= 4) {
      this.status = 'Half-day';
    }
  }
});

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
