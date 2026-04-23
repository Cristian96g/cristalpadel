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

function normalizeOrigin(origin) {
  return String(origin || "").trim().replace(/\/+$/, "");
}

function parseAllowedOrigins() {
  const defaults = [
    "http://localhost:5173",
    "https://cristalpadel.vercel.app",
  ];

  const envOrigins = [
    ...(process.env.CORS_ORIGIN || "").split(","),
    ...(process.env.FRONTEND_URL || "").split(","),
  ];

  return [...defaults, ...envOrigins]
    .map(normalizeOrigin)
    .filter(Boolean)
    .filter((origin, index, arr) => arr.indexOf(origin) === index);
}

const app = express();
const server = http.createServer(app);
const allowedOrigins = parseAllowedOrigins();

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin ${normalizedOrigin}`));
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH"],
  },
});

setIO(io);

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
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
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.get("/health", (req, res) => res.json({ ok: true }));
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).json({ message: "Backend iniciando conexion con la base de datos" });
});

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

    console.log("Allowed CORS origins:", allowedOrigins.join(", "));

    server.listen(PORT, () => {
      console.log(`API + Socket running on http://localhost:${PORT}`);
    });

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
}

start();
