
import express from "express";
import { getUserProfile, updateUserProfile } from "../controllers/usersController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/profile", auth, getUserProfile);
router.put("/profile", auth, updateUserProfile);

export default router;
