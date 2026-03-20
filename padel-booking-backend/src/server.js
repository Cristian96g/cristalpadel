import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { applyDnsFix } from "./config/dnsFix.js";
import availabilityRouter from "./routes/availabilityRoutes.js";
import bookingsRouter from "./routes/bookingsRoutes.js";
import adminRouter from "./routes/adminRoutes.js"
dotenv.config();
applyDnsFix();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api/admin", adminRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/bookings", bookingsRouter);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI in .env");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`✅ API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

start();