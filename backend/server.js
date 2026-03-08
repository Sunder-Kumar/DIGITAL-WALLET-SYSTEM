const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict to your frontend URL
    methods: ["GET", "POST"]
  }
});

// Attach io to global for controller access
global.io = io;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Authenticated users join a room named after their ID
  socket.on('join_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  });

  // Pillar 3: Admin Global Monitor
  socket.on('join_admin_monitor', () => {
    socket.join('admin_alerts');
    console.log('Admin joined global alert stream');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Logging
app.use(morgan('combined'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, // Increased for development
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use('/api', limiter);

// Routes
app.use('/api', apiRoutes);

// Socket.io Configuration
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
