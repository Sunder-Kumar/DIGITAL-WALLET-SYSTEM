const express = require('express');
const https = require('https');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const selfsigned = require('selfsigned');

dotenv.config();

const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');

const app = express();

// SSL Certificate Generation for local development
let server;
const certPath = './cert.pem';
const keyPath = './key.pem';

if (process.env.NODE_ENV !== 'production') {
  let cert, key;
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    console.log("Loading existing SSL certificates...");
    cert = fs.readFileSync(certPath);
    key = fs.readFileSync(keyPath);
  } else {
    console.log("Generating fresh SSL certificates for", '192.168.0.38', "...");
    try {
      const attrs = [{ name: 'commonName', value: '192.168.0.38' }];
      const pems = selfsigned.generate(attrs, { days: 365 });
      
      cert = pems.cert;
      key = pems.private;
      
      if (!cert || !key) throw new Error("SSL generation returned empty data");

      fs.writeFileSync(certPath, cert);
      fs.writeFileSync(keyPath, key);
      console.log("✅ SSL certificates generated and saved successfully.");
    } catch (e) {
      console.error("❌ SSL Generation Error:", e.message);
      console.warn("⚠️ Falling back to HTTP. Mobile camera will be disabled.");
      server = http.createServer(app);
    }
  }
  if (!server) server = https.createServer({ key, cert }, app);
} else {
  server = http.createServer(app);
}

const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict to your frontend URL
    methods: ["GET", "POST"]
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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
