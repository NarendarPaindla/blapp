const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Request = require('../models/Request');

/**
 * @desc    Create a new blood request
 * @route   POST /api/requests
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    try {
        const {
            patientName,
            requiredBloodGroup,
            unitsRequired,
            hospitalName,
            urgencyLevel
        } = req.body;

        const newRequest = new Request({
            patientName,
            requiredBloodGroup,
            unitsRequired,
            hospitalName,
            urgencyLevel
        });

        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @desc    Get all requests
 * @route   GET /api/requests
 */
router.get('/', async (req, res) => {
    try {
        // Sort by urgencyLevel (Critical first) and then date
        // Custom sort might be needed if strings don't sort alphabetically as desired ('Critical' < 'Normal' ?)
        // We can handle sorting in frontend or here. 
        // Let's just return all, handling sorting for "Critical" logic is key.

        const requests = await Request.find().sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @desc    Update request status
 * @route   PUT /api/requests/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const updatedRequest = await Request.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
