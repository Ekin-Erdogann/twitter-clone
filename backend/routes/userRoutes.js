import express from 'express';
import { protectedRoute } from '../middleware/protectedRoute.js';
import { getUsersProfile, getSuggestions, followUnfollowUser, updateProfile } from '../controllers/userController.js';
const router = express.Router();

router.get("/profile/:userName",protectedRoute,getUsersProfile);
router.get("/suggestions",protectedRoute,getSuggestions);
router.post("/follow/:userId",protectedRoute,followUnfollowUser);
router.post("/update",protectedRoute,updateProfile);

export default router;