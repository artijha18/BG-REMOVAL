// server/models/jobs.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    // ID of the user who initiated the job (from Clerk JWT)
    userId: {
        type: String,
       // required: true,
        index: true // For fast querying of user history
    },
    // Original name of the file uploaded
    originalFileName: {
        type: String,
        required: true
    },
    // Status of the processing
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    // Optional: URL or path to the resulting image (e.g., S3 link)
    resultUrl: {
        type: String,
        default: null
    },
    // Timestamp for when the job was created
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Timestamp for when the job was completed/failed
    completedAt: {
        type: Date,
        default: null
    }
});

const Job = mongoose.model('Job', JobSchema);
module.exports = Job;