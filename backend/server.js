const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Express Application configuration
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI || mongoURI === 'your_connection_string_here') {
  console.log('⚠️ MongoDB Connection String (MONGO_URI) is not configured yet in .env');
} else {
  mongoose.connect(mongoURI)
    .then(() => console.log('🍃 MongoDB Connected Successfully!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const popRoutes = require('./routes/popRoutes');
const authRoutes = require('./routes/authRoutes');
const vaultRoutes = require('./routes/vaultRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const Message = require('./models/Message');
const tradeRoutes = require('./routes/tradeRoutes');
const messageRoutes = require('./routes/messageRoutes');
const catalogRoutes = require('./routes/catalogRoutes');

app.use('/api/pops', popRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/catalog', catalogRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MyPopVault API is running!'
  });
});

// Configure Socket.io
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.set('io', io);

// Online users tracking
let onlineUsers = [];

const getUniqueOnlineUsers = () => {
  const names = onlineUsers.map(u => u.username);
  return [...new Set(names)];
};

io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // Globally register user to room
  socket.on('register_user', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`👤 Socket ${socket.id} globally registered to room: ${userId}`);
    }
  });

  // When a user joins the chat
  socket.on('joinChat', (userData) => {
    const username = userData?.username || 'Anonymous';
    const userId = userData?.userId;
    socket.username = username;
    
    if (userId) {
      socket.join(userId);
      console.log(`👤 Socket ${socket.id} joined room for userId: ${userId}`);
    }
    
    // Add to onlineUsers
    onlineUsers.push({ socketId: socket.id, username, userId });
    
    // Emit updated unique list
    io.emit('onlineUsers', getUniqueOnlineUsers());
    console.log(`👤 User joined: ${username}. Total connections: ${onlineUsers.length}`);
  });

  // When client sends a message
  socket.on('sendMessage', async (messageText) => {
    try {
      const senderName = socket.username || 'Anonymous';
      const newMessage = new Message({
        senderName,
        text: messageText
      });
      await newMessage.save();

      // Broadcast message to everyone
      io.emit('message', newMessage);
    } catch (err) {
      console.error('❌ Error saving message:', err);
    }
  });

  // When a user sends a private message
  socket.on('sendPrivateMessage', async (data) => {
    const { senderId, receiverId, text } = data;
    console.log(`📥 [Socket IO Backend] Received sendPrivateMessage from ${senderId} to ${receiverId}: "${text}"`);
    try {
      const PrivateMessage = require('./models/PrivateMessage');
      
      const newMessage = new PrivateMessage({
        sender: senderId,
        receiver: receiverId,
        text
      });
      await newMessage.save();

      console.log(`📤 [Socket IO Backend] Saved. Broadcasting privateMessage to receiver room: ${receiverId} and sender room: ${senderId}`);
      // Emit privateMessage event to both the receiver and the sender room
      io.to(receiverId).to(senderId).emit('privateMessage', newMessage);
    } catch (err) {
      console.error('❌ Socket Private Message Error:', err);
    }
  });

  // On disconnect
  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);
    io.emit('onlineUsers', getUniqueOnlineUsers());
    console.log(`🔌 Client disconnected: ${socket.id}. Remaining connections: ${onlineUsers.length}`);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Health check available at http://localhost:${PORT}/api/health`);
  
  // Initialize cron task scheduler
  try {
    const { initCron } = require('./services/cronService');
    initCron();
  } catch (err) {
    console.error('❌ Cron Initialization Error:', err);
  }
});
