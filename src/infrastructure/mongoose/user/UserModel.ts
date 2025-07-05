import { Schema, model, Document } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  roles: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}

const UserSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  roles: [{ type: String, required: true }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: null },
  emailVerified: { type: Boolean, default: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null }
});

export const UserModel = model<UserDocument>("User", UserSchema);
