import express from 'express';
import { login, register, getCurrentUser, sendOTP, verifyOTP } from '../controllers/authController.js';
import upload from '../middlewares/multer.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register', upload.single('registrationDocument'), register);
authRouter.post('/login', login);
authRouter.get('/user', authenticateUser, getCurrentUser);

// OTP Routes for Email Verification
authRouter.post('/send-otp', sendOTP);      // Resend OTP
authRouter.post('/verify-otp', verifyOTP);  // Verify OTP and activate account

export default authRouter;