import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js'; // Keep for configuration
import authRouter from './routes/authRoutes.js';
import studentRouter from './routes/studentRoutes.js';
import mentorRouter from './routes/mentorRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import companyRouter from './routes/companyRoutes.js';
import resumeParserRouter from './routes/resumeParserRoutes.js';
import applicationRouter from './routes/applicationRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';

// App config
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001","https://level-up-five.vercel.app","http://192.168.8.112:3000"], // Frontend URLs
    methods: ["GET", "POST"],
    credentials: true
  }
});
// Make io instance globally available
global.io = io;
const port = process.env.PORT || 4000;

connectDB();
// connectCloudinary(); // Ensure Cloudinary is configured

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added for multipart/form-data
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001","https://level-up-five.vercel.app"],
  credentials: true
}));

// API endpoints
app.get('/', (req, res) => {
  res.send('API working');
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/student', studentRouter);
app.use('/api/mentor', mentorRouter);
app.use('/api/admin', adminRouter);
app.use('/api/company', companyRouter);
app.use('/api/resume', resumeParserRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationRouter);

// Multer error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
  next();
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

server.listen(port, () => {
  console.log('Server started on port: ', port);
  console.log('Socket.IO server ready for connections');
});