import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Item from "@/models/Item";

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

const SEED_ITEMS = [
  {
    name: "Blue Water Bottle",
    status: "Found",
    category: "Accessories",
    location: "Library Hall A",
    description: "Milton brand, 1 liter bottle with a sticker on the side.",
    contact: "9876543210",
    date: "2026-02-15",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=200&fit=crop",
  },
  {
    name: "Scientific Calculator",
    status: "Lost",
    category: "Electronics",
    location: "Lab 302",
    description: "Casio FX-991EX. Has a name tag 'Rahul' on the back.",
    contact: "rahul@campus.edu",
    date: "2026-02-14",
    image:
      "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&h=200&fit=crop",
  },
  {
    name: "Data Structures Textbook",
    status: "Found",
    category: "Books",
    location: "Seminar Hall B",
    description:
      "By Cormen (CLRS), 3rd edition. Dog-eared pages, highlighted chapters 4-8.",
    contact: "librarydesk@campus.edu",
    date: "2026-02-13",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=200&fit=crop",
  },
  {
    name: "Student ID Card",
    status: "Lost",
    category: "IDs & Cards",
    location: "Main Canteen",
    description:
      "University ID for Priya Sharma, Roll No. 22CS104. Blue lanyard attached.",
    contact: "priya.s@campus.edu",
    date: "2026-02-12",
    image:
      "https://images.unsplash.com/photo-1578670812003-60745e2c2ea9?w=400&h=200&fit=crop",
  },
  {
    name: "Black Denim Jacket",
    status: "Found",
    category: "Clothing",
    location: "Auditorium, Row 12",
    description:
      "Men's medium-sized black denim jacket. Zara brand. Left after cultural fest.",
    contact: "9988776655",
    date: "2026-02-11",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=200&fit=crop",
  },
  {
    name: "Umbrella (Transparent)",
    status: "Lost",
    category: "Other",
    location: "Parking Lot Gate 2",
    description:
      "Transparent dome-shaped umbrella with a wooden handle. Sentimental value.",
    contact: "amit.k@campus.edu",
    date: "2026-02-10",
    image:
      "https://images.unsplash.com/photo-1534309466160-70b22cc6254b?w=400&h=200&fit=crop",
  },
];

export async function POST() {
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

    // --- Seed Items ---
    const itemCount = await Item.countDocuments();
    if (itemCount === 0) {
      const itemsWithAudit = SEED_ITEMS.map((item, i) => {
        const submitter = i % 2 === 0 ? adminUser : studentUser;
        return {
          ...item,
          submittedBy: {
            userId: submitter._id,
            name: submitter.name,
            email: submitter.email,
            role: submitter.role,
          },
          submittedAt: new Date(`2026-02-${15 - i}T10:00:00Z`),
          statusHistory: [
            {
              status: item.status,
              changedBy: {
                userId: submitter._id,
                name: submitter.name,
                email: submitter.email,
                role: submitter.role,
              },
              changedAt: new Date(`2026-02-${15 - i}T10:00:00Z`),
              note: "Initial report",
            },
          ],
        };
      });

      await Item.insertMany(itemsWithAudit);
    }

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
