import fs from "fs";
import mongoose from "mongoose";

const envContent = fs.readFileSync(".env.local", "utf-8");
const mongoUriLine = envContent.split("\n").find(line => line.startsWith("MONGODB_URI="));
const MONGODB_URI = mongoUriLine.split("=").slice(1).join("=").trim();

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", UserSchema, "users");

async function main() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to:", mongoose.connection.name);

    const user = await User.findOne({ email: "admin@campus.edu" });
    console.log("User found:", user ? user.toObject() : null);

    const allUsers = await User.find({}, { email: 1, role: 1 });
    console.log("All users in DB:", allUsers.map(u => ({ email: u.email, role: u.role })));

    await mongoose.disconnect();
}

main().catch(console.error);