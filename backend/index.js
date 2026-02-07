const express = require('express');
const dotenv= require('dotenv');
dotenv.config();
const connectToDB = require('./database/db');

const app = express();

connectToDB();

const PORT= process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server running at address http://localhost:${PORT}`);
})