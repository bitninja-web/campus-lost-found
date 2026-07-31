import mongoose from "mongoose";

const StatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Lost", "Found", "Claimed"],
      required: true,
    },
    changedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      email: String,
      role: String,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: 80,
    },
    status: {
      type: String,
      enum: ["Lost", "Found", "Claimed"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Electronics",
        "Accessories",
        "Books",
        "IDs & Cards",
        "Clothing",
        "Other",
      ],
      required: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: 100,
    },
    contact: {
      type: String,
      required: [true, "Contact info is required"],
      trim: true,
      maxlength: 100,
    },
    date: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },

    // ── Audit Trail ──
    submittedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      email: String,
      role: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },

    claimedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      email: String,
      claimedAt: Date,
    },

    handedOverAt: {
      type: Date,
      default: null,
    },

    statusHistory: [StatusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Index for common queries
ItemSchema.index({ status: 1 });
ItemSchema.index({ category: 1 });
ItemSchema.index({ date: -1 });

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);
