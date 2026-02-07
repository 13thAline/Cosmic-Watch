const express = require('express');
const dotenv= require('dotenv');
dotenv.config();
const connectToDB = require('./database/db');
const router = require('./routes/authRoutes.js');
const {getAsteroidById} = require("./services/nasa.service.js"); //1
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', router);


connectToDB();

const PORT= process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server running at address http://localhost:${PORT}`);
})

//============//
const testNasa = async () => {
    try {
        const data = await getAsteroidById("3542519"); 
        console.log("NASA API Connection Successful!");
        console.log("Asteroid Name:", data.name);
        //console.log("Asteroid start time:, ", data.close_approach_data[0].close_approach_date_full);
        const diameter = data.estimated_diameter.kilometers;
        console.log(`Diameter: ${diameter.estimated_diameter_min.toFixed(2)} - ${diameter.estimated_diameter_max.toFixed(2)} km`);
        const latestApproach = data.close_approach_data[0];
        console.log("Relative Velocity:", latestApproach.relative_velocity.kilometers_per_hour, "km/h");
    } catch (error) {
        console.error("NASA API Error:", error.response?.data || error.message);
    }
};

testNasa();