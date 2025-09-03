import express from 'express';
import authRouter from './routes/auth.route.js';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js'
import cookieParser from 'cookie-parser'
import messageRouter from './routes/message.route.js'
import cors from 'cors';
import { app, server } from './lib/socket.js'
import path from 'path';

// pull env 
dotenv.config();

// create 
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve()



// express app middlware
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended:true, parameterLimit: 50000}));
app.use(cookieParser());
app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? process.env.FRONTEND_DEV_URL : '*',
    credentials: process.env.NODE_ENV === 'development'
}));

// express routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);

// serve static if in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    // serve react frontend
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}


// socket server listen
server.listen(PORT, () => {
    console.log(`Websocket server is running on PORT: ${PORT}`);
    connectDB();
})

// Health check on deployment (curl http://localhost:5000/)
app.get('/health', (req, res) => {
    res.send(' Express backend is running');
});