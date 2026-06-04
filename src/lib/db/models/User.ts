import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string;
  preferences: {
    currency: string;
    theme: "dark" | "light";
    emailNotifications: boolean;
    pushNotifications: boolean;
    alertThreshold: number;
  };
  role: "user" | "admin";
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    preferences: {
      currency: { type: String, default: "INR" },
      theme: { type: String, enum: ["dark", "light"], default: "dark" },
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: false },
      alertThreshold: { type: Number, default: 5 },
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

userSchema.set("toJSON", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.password;
    return ret;
  },
});

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);
