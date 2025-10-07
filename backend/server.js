require('dotenv').config();
const express = require('express');
const connectDb = require('./db/db');
const cors = require('cors')
const path = require('path')
const indexRoutes = require('./routes/index.routes');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const port = process.env.PORT || 4000

app.use(express.json())
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000' || "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

require('./helper/cronJob');
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api', indexRoutes);

// Define a root route
app.get('/', (req, res) => {
    res.send('Hello Music Player ! 🎵🎹');
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000' || "*"],
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    socket.on('project:join', ({ projectId, userName }) => {
        if (!projectId) return;
        socket.join(`project:${projectId}`);
        socket.data.projectId = projectId;
        socket.to(`project:${projectId}`).emit('project:user-joined', { userName: userName || 'Guest', socketId: socket.id });
    });

    socket.on('project:change', ({ projectId, change }) => {
        if (!projectId) return;
        socket.to(`project:${projectId}`).emit('project:change', { change });
    });

    socket.on('project:request-sync', ({ projectId }) => {
        if (!projectId) return;
        socket.to(`project:${projectId}`).emit('project:request-sync');
    });

    socket.on('project:sync-state', ({ projectId, state, to }) => {
        if (!projectId || !state) return;
        if (to) {
            io.to(to).emit('project:sync-state', { state, from: socket.id });
        } else {
            // Broadcast to everyone in the room
            io.to(`project:${projectId}`).emit('project:sync-state', { state, from: socket.id });
        }
    });

    socket.on('disconnect', () => {
        const projectId = socket.data.projectId;
        if (projectId) {
            socket.to(`project:${projectId}`).emit('project:user-left', { socketId: socket.id });
        }
    });
});

server.listen(port, () => {
    connectDb();
    console.log(`Server is running on port ${port}`);
});
