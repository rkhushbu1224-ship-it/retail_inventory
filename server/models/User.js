import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    employeeCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      required: true,
      enum: ['Admin', 'Staff', 'SuperAdmin', 'SubDepartmentAdmin', 'StoreManager', 'StoreUser', 'Employee', 'SMG', 'Obsolete'],
      default: 'Staff',
    },
    departmentId: { type: String, default: 'DEPT-ELEC-01' },
    storeId: { type: String, default: 'STR-CENTRAL-01' },
    designation: { type: String, default: 'Inventory Executive' },
    mobileNumber: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
