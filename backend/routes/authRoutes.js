import express from 'express';
import { login, register } from '../controllers/authController.js';
import upload from '../middlewares/multer.js';

const authRouter = express.Router();

authRouter.post('/register', upload.single('registrationDocument'), register);
authRouter.post('/login', login);

export default authRouter;