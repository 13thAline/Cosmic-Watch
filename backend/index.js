const express = require('express');
const dotenv= require('dotenv');
dotenv.config();
const connectToDB = require('./database/db');
const router = require('./routes/authRoutes.js');
const cors = require("cors");
const asteroidRouter = require('./routes/asteroidRouter.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', router);
app.use('/api/asteroids', asteroidRouter);


connectToDB();

const PORT= process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server running at address http://localhost:${PORT}`);
})

