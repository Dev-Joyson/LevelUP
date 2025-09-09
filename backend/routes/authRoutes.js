import express from 'express';
import { login, register, getCurrentUser } from '../controllers/authController.js';
import upload from '../middlewares/multer.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register', upload.single('registrationDocument'), register);
authRouter.post('/login', login);
authRouter.get('/user', authenticateUser, getCurrentUser);

export default authRouter;