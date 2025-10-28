require('dotenv').config();
const express = require('express');
const connectDb = require('./db/db');
const cors = require('cors')
const path = require('path')
const indexRoutes = require('./routes/index.routes');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const socketManager = require('./socketManager/socketManager');
 
const app = express();
const port = process.env.PORT || 5000
 
app.use(express.json())
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
 
// Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true
    },
    transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
});
 
socketManager.initializeSocket(io);
 
require('./helper/cronJob');
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api', indexRoutes);
 
// Define a root route
app.get('/', (req, res) => {
    res.send('Hello Music Player ! 🎵🎹');
});
 
server.listen(port, () => {
    connectDb();
    console.log(`Server + Socket.IO is running on port ${port}`);
});
 