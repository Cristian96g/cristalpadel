import express from "express";
import {
  createBooking,
  cancelBooking,
  getBookingsByDate,
} from "../controllers/bookingsController.js";

const router = express.Router();

router.get("/", getBookingsByDate);
router.post("/", createBooking);
router.patch("/:id/cancel", cancelBooking);

export default router;