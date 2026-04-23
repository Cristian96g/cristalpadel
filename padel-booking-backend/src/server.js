import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";


import { applyDnsFix } from "./config/dnsFix.js";
import fixedBookingsRouter from "./routes/fixedBookingsRoutes.js";
import availabilityRouter from "./routes/availabilityRoutes.js";
import bookingsRouter from "./routes/bookingsRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import tournamentsRouter from "./routes/tournamentsRoutes.js";
import adminTournamentsRouter from "./routes/adminTournamentsRoutes.js";
import { setIO } from "./socket.js";
import { rateLimit } from "./middlewares/rateLimit.js";

dotenv.config();
applyDnsFix();

const app = express();
const server = http.createServer(app);
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOrigin = allowedOrigins.length ? allowedOrigins : "*";

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST", "PATCH"],
  },
});

setIO(io);

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
app.use(express.json({ limit: "25kb" }));
app.use(
  cors({
    origin: corsOrigin,
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 10, keyPrefix: "login" }));
app.use("/api/bookings", rateLimit({ windowMs: 60 * 1000, max: 30, keyPrefix: "bookings" }));
app.use("/api/tournaments", tournamentsRouter);
app.use("/api/fixed-bookings", fixedBookingsRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/admin/tournaments", adminTournamentsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Missing MONGODB_URI in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    server.listen(PORT, () => {
      console.log(`✅ API + Socket running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

start();
