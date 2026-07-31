import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const SEED_USERS = [
  {
    name: "Campus Admin",
    email: "admin@campus.edu",
    password: "x7Q@m#9Lp$2Bv&W",
    role: "admin",
  },
  {
    name: "Rahul Sharma",
    email: "student@campus.edu",
    password: "x7Q@m#9Lp$2Bv&W",
    role: "student",
  },
];

export async function GET() {
  try {
    await connectDB();

    // --- Seed Users ---
    const createdUsers = [];
    for (const userData of SEED_USERS) {
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        createdUsers.push(exists);
        continue;
      }
      const hashed = await bcrypt.hash(userData.password, 12);
      const user = await User.create({ ...userData, password: hashed });
      createdUsers.push(user);
    }

    const adminUser = createdUsers.find((u) => u.role === "admin");
    const studentUser = createdUsers.find((u) => u.role === "student");

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      users: SEED_USERS.map((u) => ({
        email: u.email,
        password: u.password,
        role: u.role,
      })),
    });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json(
      { error: "Failed to seed database", details: err.message },
      { status: 500 }
    );
  }
}
