import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import { getAdminGrid, cancelAdminBooking, confirmAdminBooking } from "../controllers/adminController.js";

const router = express.Router();

router.use(adminAuth);

router.get("/grid", getAdminGrid);
router.patch("/bookings/:id/cancel", cancelAdminBooking);
router.patch("/bookings/:id/confirm", confirmAdminBooking);

export default router;
