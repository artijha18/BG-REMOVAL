const fetchModule = require('node-fetch');
const fetch = fetchModule.default || fetchModule; 
const FormData = require('form-data'); 
const Job = require('../models/jobs'); 

// ⭐️ LOCAL API ENDPOINT ⭐️
// This must match the address where rembg_api.py is running (http://localhost:5000/remove).
const REMBG_LOCAL_URL = 'http://localhost:5000/remove'; 

/**
 * Controller function to handle image upload and background removal via local Python service.
 */
exports.removeBackgroundController = async (req, res) => {
    console.log('--- START IMAGE PROCESSING REQUEST (U2NET/REMBG LOCAL) ---');
    
    const { userId } = req; // Attached by authMiddleware (will be undefined if testing via Postman without token)
    const { buffer, originalname } = req.file || {};

    if (!buffer) {
        console.error('LOG: Request failed due to missing file buffer.');
        return res.status(400).json({ message: 'No image file uploaded.' });
    }
    
    let job;
    try {
        // 1. Create a DB Job as PENDING
        job = await Job.create({ userId, originalFileName: originalname, status: 'PENDING' });
        console.log(`LOG: DB Job Created: ${job._id}`);

        // 2. Prepare Form Data for the Python Service
        // The Python service expects a file named 'image'
        const form = new FormData();
        const fileName = originalname || 'input.png';
        const mimeType = req.file.mimetype;
        
        console.log(`LOG: Preparing file ${fileName} (${buffer.length} bytes) with MIME type: ${mimeType}`);

        form.append('image', buffer, { 
            filename: fileName, 
            contentType: mimeType
        });
        
        const formHeaders = form.getHeaders();
        
        console.log(`LOG: Sending POST to local service at ${REMBG_LOCAL_URL}`);

        // 3. Make the POST request to the local Python API
        const response = await fetch(REMBG_LOCAL_URL, {
            method: 'POST',
            headers: {
                // Pass the generated form headers (including the boundary)
                ...formHeaders
            },
            body: form,
        });
        
        // 4. Handle API errors from the local service
        if (!response.ok) {
            const errorText = await response.text();
            
            console.error(`ERROR: Local service responded with HTTP Status ${response.status}`);
            console.error(`ERROR: Response Text: ${errorText}`);

            let errorDetail = errorText;
            try {
                // Attempt to parse JSON error detail from the Python service
                const errorJson = JSON.parse(errorText);
                errorDetail = errorJson.error || errorText;
            } catch (e) {
                // If not JSON, use the raw text
            }
            
            throw new Error(`Local Background Service Error: ${response.status}. Details: ${errorDetail}`);
        }

        // 5. Get the processed image buffer (This will be a PNG with transparency)
        const processedImageBuffer = await response.buffer();

        // 6. Log the job as COMPLETED
        job.status = 'COMPLETED';
        job.completedAt = new Date();
        await job.save();

        console.log(`LOG: Image processed successfully! Buffer length: ${processedImageBuffer.length} bytes`);
        console.log('--- END IMAGE PROCESSING REQUEST (SUCCESS) ---');

        // 7. SUCCESS: Send the resulting buffer back to the client
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(processedImageBuffer);

    } catch (error) {
        // Log the error for debugging
        console.error('LOG: Full Error Caught in Controller:', error);
        
        // Log the failure in the database
        if (job) {
            job.status = 'FAILED';
            job.resultUrl = `ERROR: ${error.message}`;
            await job.save();
        }

        // Send a generic error response to the client
        res.status(500).json({ message: error.message || 'Image processing failed. Check Python console for details.' });
    }
};