const mongoose = require('mongoose');

const connectToDB = async ()=>{
    try {
        await mongoose.connect('mongodb://localhost:27017/NASA')
            console.log("DB connection successful");
    } catch (error) {
        console.error("DB connection failed: ", error);
        process.exit(1);
    }
}

module.exports = connectToDB;