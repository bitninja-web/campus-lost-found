import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Item from "@/models/Item";
import Image from "@/models/Image";

// ── Helpers ──
function sanitize(val, maxLen = 500) {
  return typeof val === "string" ? val.trim().slice(0, maxLen) : "";
}

const VALID_STATUSES = ["Lost", "Found", "Claimed"];
const VALID_CATEGORIES = [
  "Electronics",
  "Accessories",
  "Books",
  "IDs & Cards",
  "Clothing",
  "Other",
];

// Strips audit fields for student role
function stripAuditFields(item) {
  const obj = item.toObject ? item.toObject() : { ...item };
  obj.id = obj._id?.toString() || obj.id;
  delete obj.submittedBy;
  delete obj.submittedAt;
  delete obj.claimedBy;
  delete obj.handedOverAt;
  delete obj.statusHistory;
  delete obj.__v;
  return obj;
}

// Full item with audit for admin
function fullItem(item) {
  const obj = item.toObject ? item.toObject() : { ...item };
  obj.id = obj._id?.toString() || obj.id;
  delete obj.__v;
  return obj;
}

// GET /api/items
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const filter = {};

    const status = searchParams.get("status");
    if (status && VALID_STATUSES.includes(status)) filter.status = status;

    const category = searchParams.get("category");
    if (category && VALID_CATEGORIES.includes(category))
      filter.category = category;

    const items = await Item.find(filter).sort({ date: -1 });

    const isAdmin = session.user.role === "admin";
    const result = items.map((item) =>
      isAdmin ? fullItem(item) : stripAuditFields(item)
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/items error:", err);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

// POST /api/items — create new item
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const name = formData.get("name");
    const status = formData.get("status");
    const category = formData.get("category");
    const location = formData.get("location");
    const contact = formData.get("contact");
    const date = formData.get("date");
    const description = formData.get("description") || "";
    const imageFile = formData.get("image");

    // Validation
    if (!name || !status || !category || !location || !contact || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Date must be YYYY-MM-DD" },
        { status: 400 }
      );
    }

    await connectDB();

    // Handle image upload — stored in MongoDB Atlas, not the filesystem
    let imageUrl = "";
    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      if (!imageFile.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image files are allowed" },
          { status: 400 }
        );
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image must be under 5 MB" },
          { status: 400 }
        );
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const imageDoc = await Image.create({
        data: buffer,
        contentType: imageFile.type,
        filename: imageFile.name,
      });

      imageUrl = `/api/images/${imageDoc._id}`;
    }

    const newItem = await Item.create({
      name: sanitize(name, 80),
      status,
      category,
      location: sanitize(location, 100),
      contact: sanitize(contact, 100),
      date,
      description: sanitize(description, 300),
      image: imageUrl,
      submittedBy: {
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
      submittedAt: new Date(),
      statusHistory: [
        {
          status,
          changedBy: {
            userId: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
          },
          changedAt: new Date(),
          note: "Initial report",
        },
      ],
    });

    const isAdmin = session.user.role === "admin";
    const result = isAdmin ? fullItem(newItem) : stripAuditFields(newItem);

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("POST /api/items error:", err);
    return NextResponse.json(
      { error: "Failed to save item" },
      { status: 500 }
    );
  }
}
