import fs from "fs";
import mongoose from "mongoose";

const envContent = fs.readFileSync(".env.local", "utf-8");
const mongoUriLine = envContent.split("\n").find(line => line.startsWith("MONGODB_URI="));
const MONGODB_URI = mongoUriLine.split("=").slice(1).join("=").trim();

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", UserSchema, "users");

async function main() {
    await mongoose.connect(MONGODB_URI);
    const result = await User.deleteMany({ email: { $in: ["admin@campus.edu", "student@campus.edu"] } });
    console.log("Deleted:", result.deletedCount, "users");
    await mongoose.disconnect();
}

main().catch(console.error);