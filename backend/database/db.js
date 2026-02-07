const mongoose = require('mongoose');

const connectToDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
            console.log("DB connection successful");
    } catch (error) {
        console.error("DB connection failed: ", error);
        process.exit(1);
    }
}

module.exports = connectToDB;