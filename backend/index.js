const express = require('express');
const dotenv= require('dotenv');
dotenv.config();
const connectToDB = require('./database/db');
const router = require('./routes/authRoutes.js');

const app = express();

app.use(express.json());
app.use('/api/auth', router);


connectToDB();

const PORT= process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server running at address http://localhost:${PORT}`);
})