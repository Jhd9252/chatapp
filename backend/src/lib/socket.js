import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

// create express application 
const app = express()

// build on top of express for access to low-level events and websocket integration
// with the benefit of middleware features of express
const server = http.createServer(app);

// create socket.io server on top of http server
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'development' ? process.env.FRONTEND_DEV_URL : '*',
        credentials: process.env.NODE_ENV === 'development'
    }
});


// store online users {userId (database): socketId (socket object)}
// Storing socketId and not socket objects uses less memory, is stateless,
// is more scalable if horizontally scaling, etc. 
// Best practice to use Id's and io.emit()
const userSocketMap = {};

const getReceiverSocketId = (userId) => {
    return userSocketMap[userId];
}

// instance of socket connection - single process/mem per user
io.on('connection', (socket) => {
    console.log('Notification: Client connected on socket, ', socket.id);

    // after successful socket connection, server send query param of userId
    const userId = socket.handshake.query.userId
    if (userId) {
        userSocketMap[userId] = socket.id
    }

    // used to broadcast events to all other connections
    // emit(eventName, {data}, callback)
    io.emit('GetOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('Notification: Client disconnected, ', socket.id);
        delete userSocketMap[userId];
        io.emit('GetOnlineUsers', Object.keys(userSocketMap));
    })
})

export {io, app, server, getReceiverSocketId};