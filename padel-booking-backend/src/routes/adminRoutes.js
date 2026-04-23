import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import {
  getAdminGrid,
  createAdminBooking,
  cancelAdminBooking,
  confirmAdminBooking,
  getAdminBookingsByDate,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(adminAuth);

router.get("/grid", getAdminGrid);
router.get("/bookings", getAdminBookingsByDate);
router.post("/bookings", createAdminBooking);
router.patch("/bookings/:id/cancel", cancelAdminBooking);
router.patch("/bookings/:id/confirm", confirmAdminBooking);

export default router;
