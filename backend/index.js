const express = require('express');
const dotenv = require('dotenv');
const { Server } = require("socket.io");
const http = require("http");
dotenv.config();
const connectToDB = require('./database/db');
const router = require('./routes/authRoutes.js');
const cors = require("cors");
const asteroidRouter = require('./routes/asteroidRouter.js');
const ephemerisRouter = require('./routes/ephemerisRouter.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', router);
app.use('/api/asteroids', asteroidRouter);
app.use('/api/ephemeris', ephemerisRouter);


io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("send_message", (data) => {
        io.emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

connectToDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running at address http://localhost:${PORT}`);
});