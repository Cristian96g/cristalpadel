import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import { getAdminGrid, cancelAdminBooking } from "../controllers/adminController.js";

const router = express.Router();

router.use(adminAuth);

router.get("/grid", getAdminGrid);
router.patch("/bookings/:id/cancel", cancelAdminBooking);

export default router;