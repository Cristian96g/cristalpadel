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
import { setIO } from "./socket.js";

dotenv.config();
applyDnsFix();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
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

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api/fixed-bookings", fixedBookingsRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/admin", adminRouter);

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