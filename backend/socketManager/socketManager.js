const jwt = require('jsonwebtoken');
const User = require('../models/user.model')
// const Project = require('../models/project.model');
// const Notification = require('../models/notification.model');

// Store user-to-socket mappings
const userSocketMap = new Map();
const socketUserMap = new Map();

let ioInstance = null;

function initializeSocket(io) {
  // Store io instance for later use
  ioInstance = io;
    console.log('io --------------------------------------->',io)
  // Socket authentication middleware
  io.use(async (socket, next) => {
    const { userId, token } = socket.handshake.auth;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      
      // Check if user exists
      console.log(decoded._id);
      const user = await User.findById(decoded._id);
      console.log(user);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.userId = userId;
      next();
    } catch (error) {
      console.error('Socket Authentication Error:', error);
      return next(new Error('Authentication error'));
    }
  });

  io.on("connection", (socket) => {
    console.log("New socket connection:", socket.id);
  
    // Handle user room joining
    socket.on("joinRoom", ({ userId }) => {
      if (userId) {
        // Store socket-user mapping
        userSocketMap.set(userId, socket.id);
        socketUserMap.set(socket.id, userId);
        console.log(`User ${userId} joined their personal room`);
      }
    });

    // Join music-specific room by ID
    socket.on("joinMusicRoom", ({ musicId }) => {
      if (!musicId) return;
      const room = `music:${musicId}`;
      try {
        socket.join(room);
        console.log(`Socket ${socket.id} joined music room ${room}`);
      } catch (err) {
        console.error(`Failed to join music room ${room}:`, err?.message || err);
      }
    });

    // Leave music-specific room
    socket.on("leaveMusicRoom", ({ musicId }) => {
      if (!musicId) return;
      const room = `music:${musicId}`;
      try {
        socket.leave(room);
        console.log(`Socket ${socket.id} left music room ${room}`);
      } catch (err) {
        console.error(`Failed to leave music room ${room}:`, err?.message || err);
      }
    });

    // Handle disconnect with cleanup
    socket.on("disconnect", (reason) => {
      console.log(`Socket ${socket.id} disconnected: ${reason}`);
       
      // Remove mappings on disconnect
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        userSocketMap.delete(userId);
        socketUserMap.delete(socket.id);
      }
    });

    // Handle reconnection
    socket.on("reconnect", () => {
      console.log(`Socket ${socket.id} reconnected`);
    });
  });

  // Cleanup disconnected sockets periodically
  setInterval(() => {
    const disconnectedSockets = [];
    
    for (const [socketId, userId] of socketUserMap.entries()) {
      const socket = io.sockets.sockets.get(socketId);
      if (!socket || !socket.connected) {
        disconnectedSockets.push({ socketId, userId });
      }
    }
    
    disconnectedSockets.forEach(({ socketId, userId }) => {
      userSocketMap.delete(userId);
      socketUserMap.delete(socketId);
      console.log(`Cleaned up disconnected socket ${socketId} for user ${userId}`);
    });
  
  }, 30000); // Check every 30 seconds
}

// Emit helper: notify clients in a music room that the music has updated
function notifyMusicUpdated(music) {
  try {
    if (!ioInstance || !music || !music._id) return;
    const room = `music:${music._id}`;
    ioInstance.to(room).emit('musicUpdated', { musicId: music._id, music });
    console.log(`Emitted musicUpdated to room ${room}`);
  } catch (err) {
    console.error('Failed emitting musicUpdated:', err?.message || err);
  }
}

// Method to emit task events to project team members
// async function emitTaskEventAdd(task, projectId) {
//   try {
//     // Get the project to find team members and owner
//     const projectDetails = await Project.findById(projectId)
//       .populate('teamMembers')
//       .populate('owner');

//     // Create a set to track unique user IDs to avoid duplicate emissions
//     const uniqueUserIds = new Set();

//     // Add team members to the set
//     projectDetails.teamMembers.forEach(member => {
//       uniqueUserIds.add(member._id.toString());
//     });     

//     // Add project owners to the set
//     projectDetails.owner.forEach(owner => {
//       uniqueUserIds.add(owner._id.toString());
//     });

//     // Emit socket event to all unique users
//     uniqueUserIds.forEach(userId => {
//       const socketId = userSocketMap.get(userId);
//       if (socketId && ioInstance) {
//         ioInstance.to(socketId).emit('newTask', { 
//           task: task, 
//           projectId: projectId 
//         });
//       }
//     });
//   } catch (error) {
//     console.error('Error emitting task event:', error);
//   }
// }
// async function emitTaskEventEdit(task, projectId) {
//   try {
//     // Get the project to find team members and owner
//     const projectDetails = await Project.findById(projectId)
//       .populate('teamMembers')
//       .populate('owner');

//     // Create a set to track unique user IDs to avoid duplicate emissions
//     const uniqueUserIds = new Set();

//     // Add team members to the set
//     projectDetails.teamMembers.forEach(member => {
//       uniqueUserIds.add(member._id.toString());
//     });     

//     // Add project owners to the set
//     projectDetails.owner.forEach(owner => {
//       uniqueUserIds.add(owner._id.toString());
//     });

//     // Emit socket event to all unique users
//     uniqueUserIds.forEach(userId => {
//       const socketId = userSocketMap.get(userId);
//       if (socketId && ioInstance) {
//         ioInstance.to(socketId).emit('editTask', { 
//           task: task, 
//           projectId: projectId 
//         });
//       }
//     });
//   } catch (error) {
//     console.error('Error emitting task event:', error);
//   }
// }
module.exports = { 
    initializeSocket,
    getUserSocketMap: () => userSocketMap,
    getSocketUserMap: () => socketUserMap,
    notifyMusicUpdated,
  };