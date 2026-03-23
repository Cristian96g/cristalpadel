import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import { createFixedBooking } from "../controllers/fixedBookingsController.js";

const router = express.Router();

router.use(adminAuth);

router.post("/", createFixedBooking);

export default router;