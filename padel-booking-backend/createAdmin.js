import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const password = await bcrypt.hash("123456", 10);

    await User.create({
      email: "admin@padel.com",
      password,
      role: "admin",
    });

    console.log("✅ Admin creado correctamente");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

run();