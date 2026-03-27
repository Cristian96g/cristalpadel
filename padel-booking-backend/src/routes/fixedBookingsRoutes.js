import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import { createFixedBooking, getFixedBookings } from "../controllers/fixedBookingsController.js";

const router = express.Router();

router.use(adminAuth);

router.post("/", createFixedBooking);
router.get("/", getFixedBookings);

export default router;