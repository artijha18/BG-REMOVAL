// server/middleware/authMiddleware.js

// Ensure you install the SDK: npm install @clerk/clerk-sdk-node
const { Clerk } = require('@clerk/clerk-sdk-node');
// ⚠️ IMPORTANT: Get your Clerk Secret Key from the dashboard ⚠️
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required. Token missing.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using the Clerk SDK
        const verifiedToken = await clerk.verifyToken(token);
        
        // Attach the user ID to the request for logging or other needs
        req.userId = verifiedToken.sub; 
        next();
        
    } catch (error) {
        console.error('Clerk Token Verification Failed:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = authMiddleware;