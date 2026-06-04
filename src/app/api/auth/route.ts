import { type NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/lib/db/models/User";
import { apiSuccess, apiError } from "@/lib/api/response";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") ?? "login";

  if (action === "register") {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid input", 400, parsed.error.flatten());
    }

    await connectDB();
    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) {
      return apiError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    const user = await User.create({
      email: parsed.data.email,
      name: parsed.data.name,
      password: hashedPassword,
      lastLoginAt: new Date(),
    });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return apiSuccess({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    }, 201);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid input", 400, parsed.error.flatten());
  }

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email });
  if (!user) {
    return apiError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(parsed.data.password, user.password);
  if (!valid) {
    return apiError("Invalid email or password", 401);
  }

  await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  return apiSuccess({
    token,
    user: { id: user._id, email: user.email, name: user.name, role: user.role },
  });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return apiError("Unauthorized", 401);
  }

  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as { userId: string };
    await connectDB();
    const user = await User.findById(decoded.userId).select("-password").lean();
    if (!user) return apiError("User not found", 404);
    return apiSuccess(user);
  } catch {
    return apiError("Invalid token", 401);
  }
}
