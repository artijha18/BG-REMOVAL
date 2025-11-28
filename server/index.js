// server/index.js (Updated)

const express = require('express');

require('dotenv').config(); 
const bodyParser = require('body-parser');
const cors = require('cors');

const connectDB = require('../server/src/config/db'); 
const imageRoutes = require('./src/Routes/imageRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'https://bg-removal-topaz-six.vercel.app/' })); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


connectDB();

// Routes
app.use('/api', imageRoutes); 



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});