const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google Public DNS for Mongo Atlas SRV resolution

require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');

const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');
const { startSimulation } = require('./services/simulationEngine');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Frontend Static Client
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api', apiRoutes);

// Catch-All Error Handler
app.use(errorHandler);

// Real-Time Socket Connection
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Start Simulation Engine
startSimulation(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[VoltFlow Server] Operational on port ${PORT}`);
  console.log(`[VoltFlow App] Running at http://localhost:${PORT}`);
});