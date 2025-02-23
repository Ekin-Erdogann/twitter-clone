import express from 'express';
import { signup ,login,logout, getMe} from '../controllers/authController.js';
import { protectedRoute } from '../middleware/protectedRoute.js';
const router = express.Router();

router.get('/me',protectedRoute, getMe); // we use the protectedRoute middleware to decode the cookies to see if the user is authenticated or not

router.post('/signup', signup);

router.post('/login', login);

router.post('/logout', logout);


export default router; // we export the router so that we can use it in other files