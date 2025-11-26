// server/config/db.js
const mongoose = require('mongoose');

// Ensure you have a .env file with your MONGO_URI
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully.');
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        // Exit process with failure
        process.exit(1); 
    }
};

module.exports = connectDB;

// You'll need to install Mongoose:
// npm install mongoose