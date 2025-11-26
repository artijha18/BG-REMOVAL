// server/middleware/multerMiddleware.js

const multer = require('multer'); // 1. Check this import!

// Configure storage strategy
const storage = multer.memoryStorage(); 

const upload = multer({ 
    storage: storage,
    // ... other config
});

// Export the middleware ready to handle a single file named 'image'
// 2. The exported value MUST be the result of a call like upload.single()
module.exports = upload.single('image');