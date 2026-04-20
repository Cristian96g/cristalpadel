import express from "express";
import {
    login, 
    register, 
    getMe,
    updateMe,
    changePassword,
} from "../controllers/authController.js";
import { adminAuth } from "../middlewares/adminAuth.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

router.get("/me", adminAuth, getMe);
router.patch("/me", adminAuth, updateMe);
router.patch("/change-password", adminAuth, changePassword);
export default router;
