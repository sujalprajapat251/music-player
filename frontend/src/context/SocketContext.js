import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useDispatch } from 'react-redux';

export const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);
console.log(SocketContext)
export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const typingTimeoutRefs = useRef(new Map());
    const socketRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const dispatch = useDispatch();
    const getAuth = () => ({
        userId: sessionStorage.getItem("userId"),
        token:  sessionStorage.getItem("token"),
    });

    const { userId, token } = getAuth();
    console.log('hey', userId)
    const initializeSocket = () => {
        // Cleanup existing socket if any
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        try {
            socketRef.current = io("http://localhost:5000", {
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
                reconnectionDelay: 1000,
                timeout: 20000,
                forceNew: true,
                auth: {
                    userId,
                    token,
                },
            });
            console.log('socketRef',socketRef.current.on)
            socketRef.current.on("connect", () => {
                console.log("✅ Socket connected to server");
                setIsConnected(true);
                setConnectionError(null);
                reconnectAttemptsRef.current = 0;
            });

            socketRef.current.on("connect_error", (error) => {
                console.error("❌ Detailed Socket Connection Error:", {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                    type: typeof error
                });

                setConnectionError(error);
                reconnectAttemptsRef.current++;

                // // Specific error handling
                // if (error.message.includes("Authentication error")) {
                //     console.error("🚫 Socket Authentication Failed. Please log in again.");
                //     // localStorage.removeItem('token');
                //     // localStorage.removeItem('userId');
                //     window.location.href = '/';
                //     return;
                // }

                // // If max reconnect attempts reached, stop trying
                // if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
                //     console.error("❌ Max reconnection attempts reached. Manual intervention required.");
                //     setIsConnected(false);
                // }
            });

            // socketRef.current.on("disconnect", (reason) => {
            //     console.log("⚠️ Socket disconnected:", reason);
            //     setIsConnected(false);

            //     // Attempt reconnection if not an intentional disconnect
            //     if (reason !== "io client disconnect") {
            //         // initializeSocket();
            //     }
            // });

            // socketRef.current.on("connect_timeout", (timeout) => {
            //     console.error("❌ Socket Connection Timeout:", timeout);
            //     setConnectionError(new Error("Connection Timeout"));
            // });

            // // Listen for notification events
            // socketRef.current.on("notification", (notification) => {
            //     console.log("📢 New notification received:", notification);
            //     dispatch(addNotification(notification));
            // });

            // // Listen for notification count updates
            // socketRef.current.on("notificationCount", (data) => {
            //     console.log("🔢 Notification count updated:", data);
            //     dispatch(updateUnreadCount(data));
            // });
        } catch (initError) {
            console.error("❌ Socket Initialization Error:", initError);
            setIsConnected(false);
            setConnectionError(initError);
        }
    };
    // Helpers to manage music-id rooms
    const joinMusicRoom = (musicId) => {
        try {
            if (!socketRef.current || !musicId) return;
            socketRef.current.emit('joinMusicRoom', { musicId });
        } catch (err) {
            console.error('joinMusicRoom error:', err);
        }
    };

    const leaveMusicRoom = (musicId) => {
        try {
            if (!socketRef.current || !musicId) return;
            socketRef.current.emit('leaveMusicRoom', { musicId });
        } catch (err) {
            console.error('leaveMusicRoom error:', err);
        }
    };
    useEffect(() => {
        // Only initialize if we have userId and token
        if (userId && token) {
            initializeSocket();
        }

        return () => {
            // Cleanup timers
            typingTimeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
            typingTimeoutRefs.current.clear();

            // Disconnect socket
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        };
    }, [userId, token]); // Re-initialize if userId or token changes

    useEffect(() => {
        if (!socketRef.current || !isConnected || !userId || !token) return;

        console.log("🔑 User authenticated, joining user room:", userId);

        // Example: join a private room
        socketRef.current.emit("joinRoom", { userId });
    }, [userId, token, isConnected]);

    return (
        <SocketContext.Provider
            value={{
                socket: socketRef.current,
                isConnected,
                connectionError,
                reconnect: initializeSocket,
                joinMusicRoom,
                leaveMusicRoom,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};
