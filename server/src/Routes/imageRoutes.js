// server/Routes/imageRoutes.js (UPDATED)

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const multerMiddleware = require('../middleware/multerMiddleware');
// ⭐️ NEW: Import the controller function ⭐️
const { removeBackgroundController } = require('../controllers/imageController'); 

// POST /api/remove-background
router.post(
    '/remove-background', 
  //  authMiddleware,         // 1. Verify Clerk JWT
    multerMiddleware,       // 2. Handle uploaded file
    removeBackgroundController // ⭐️ 3. Execute the core controller logic ⭐️
);

module.exports = router;