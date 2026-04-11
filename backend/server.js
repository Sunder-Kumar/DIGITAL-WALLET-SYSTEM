const express = require('express');
const https = require('https');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');

const app = express();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

// Server Instance Creation
// Defaulting to HTTP for smooth local development
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  }
});

// Attach io to global for controller access
global.io = io;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Authenticated users join a room named after their ID
  socket.on('join_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  });

  // Handle Real-time Private Messaging
  socket.on('private_message', (data) => {
    const { recipientId } = data;
    io.to(`user_${recipientId}`).emit('receive_message', {
      ...data,
      timestamp: new Date()
    });
  });

  // Pillar 3: Admin Global Monitor
  socket.on('join_admin_monitor', () => {
    socket.join('admin_alerts');
    console.log('Admin joined global alert stream');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());

// Logging
app.use(morgan('combined'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500,
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use('/api', limiter);

// Routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
