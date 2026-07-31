import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Item from "@/models/Item";
import Image from "@/models/Image";
import mongoose from "mongoose";

// ── Helpers ──
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

function fullItem(item) {
  const obj = item.toObject ? item.toObject() : { ...item };
  obj.id = obj._id?.toString() || obj.id;
  delete obj.__v;
  return obj;
}

// Deletes the Image document in Atlas that backs an item's image URL, if any.
// Safe to call even if the item has no image, or an old /uploads/ path.
async function deleteAssociatedImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("/api/images/")) return;

  const imageId = imageUrl.split("/").pop();
  if (!mongoose.Types.ObjectId.isValid(imageId)) return;

  try {
    await Image.findByIdAndDelete(imageId);
  } catch (err) {
    // Non-fatal — don't let image cleanup block the item operation
    console.error("Failed to delete associated image:", err);
  }
}

const VALID_STATUSES = ["Lost", "Found", "Claimed"];

// GET /api/items/:id
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "admin";
    return NextResponse.json(isAdmin ? fullItem(item) : stripAuditFields(item));
  } catch (err) {
    console.error("GET /api/items/:id error:", err);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

// PATCH /api/items/:id — Both roles can claim, admin can edit all fields
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "admin";

    const { id } = await params;
    await connectDB();

    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const body = await request.json();

    // Students can ONLY change status to "Claimed"
    if (!isAdmin) {
      if (!body.status || body.status !== "Claimed") {
        return NextResponse.json(
          { error: "Students can only claim items" },
          { status: 403 }
        );
      }
      // Only allow status change for students
      item.status = "Claimed";
    } else {
      // Admin can update all allowed fields
      const allowed = [
        "status",
        "name",
        "description",
        "location",
        "contact",
        "date",
        "category",
      ];

      for (const key of allowed) {
        if (body[key] !== undefined) {
          item[key] = body[key];
        }
      }
    }

    // Validate status
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // If marking as Claimed, record who claimed it
    if (body.status === "Claimed") {
      item.claimedBy = {
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        claimedAt: new Date(),
      };
      item.handedOverAt = new Date();
    }

    // Append to status history
    if (body.status) {
      item.statusHistory.push({
        status: body.status,
        changedBy: {
          userId: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        },
        changedAt: new Date(),
        note: body.note || `Status changed to ${body.status}`,
      });
    }

    await item.save();

    // Return role-appropriate response
    return NextResponse.json(isAdmin ? fullItem(item) : stripAuditFields(item));
  } catch (err) {
    console.error("PATCH /api/items/:id error:", err);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE /api/items/:id — Admin only
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can delete
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectDB();

    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Clean up the associated image document in MongoDB Atlas, if any
    await deleteAssociatedImage(item.image);

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (err) {
    console.error("DELETE /api/items/:id error:", err);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
