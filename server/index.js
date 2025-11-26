// server/index.js (Updated)

const express = require('express');
// ⭐️ NEW: Load environment variables ⭐️
require('dotenv').config(); 
const bodyParser = require('body-parser');
const cors = require('cors');
// ⭐️ NEW: Database connection ⭐️
const connectDB = require('../server/src/config/db'); 
const imageRoutes = require('./src/Routes/imageRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' })); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ⭐️ Connect Database ⭐️
connectDB();

// Routes
app.use('/api', imageRoutes); 

// ... (rest of the file remains the same)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});