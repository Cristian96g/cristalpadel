import express from "express";
import {
  createBooking,
  cancelBooking,
  getBookingsByDate,
  getBookingById,
} from "../controllers/bookingsController.js";

const router = express.Router();

router.get("/", getBookingsByDate);
router.get("/:id", getBookingById);
router.post("/", createBooking);
router.patch("/:id/cancel", cancelBooking);

export default router;
