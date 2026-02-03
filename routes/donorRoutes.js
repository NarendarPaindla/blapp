const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Donor = require('../models/Donor');

// --- Business Logic: Compatibility Mapping (Donor -> Recipients) ---
// This maps who a DONOR with a specific group can GIVE to.
const donorCompatibility = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Donor
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
};

/**
 * @desc    Register a new donor
 * @route   POST /api/donors/register
 */
router.post('/register', async (req, res) => {
    try {
        const { name, age, bloodGroup, phone, location, lastDonationDate } = req.body;

        // Validation: Eligibility (90 days rule)
        let availabilityStatus = 'Available';
        if (lastDonationDate) {
            const lastDate = new Date(lastDonationDate);
            const today = new Date();
            const diffTime = Math.abs(today - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 90) {
                // If the user wants to enforce rejection, we can return error. 
                // However, requirements say "donor marked ineligible". 
                // We will register them but mark as Unavailable.
                availabilityStatus = 'Unavailable';
            }
        }

        const newDonor = new Donor({
            name,
            age,
            bloodGroup,
            phone,
            location,
            lastDonationDate,
            availabilityStatus
        });

        const savedDonor = await newDonor.save();
        res.status(201).json(savedDonor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @desc    Get all donors
 * @route   GET /api/donors
 */
router.get('/', async (req, res) => {
    try {
        const donors = await Donor.find();
        res.status(200).json(donors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @desc    Search for compatible donors based on PATIENT's blood group
 * @route   GET /api/donors/:bloodGroup
 */
router.get('/:bloodGroup', async (req, res) => {
    try {
        const patientGroup = req.params.bloodGroup;

        // Find which donor groups can give to this patient logic
        // We iterate through our donorCompatibility map
        const compatibleDonorGroups = [];

        for (const [donorGroup, recipients] of Object.entries(donorCompatibility)) {
            if (recipients.includes(patientGroup)) {
                compatibleDonorGroups.push(donorGroup);
            }
        }

        if (compatibleDonorGroups.length === 0) {
            return res.status(200).json([]);
        }

        // Fetch donors who match the compatible groups and are Available
        const donors = await Donor.find({
            bloodGroup: { $in: compatibleDonorGroups },
            availabilityStatus: 'Available'
        });

        res.status(200).json(donors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @desc    Update donor details
 * @route   PUT /api/donors/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const updatedDonor = await Donor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedDonor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @desc    Delete donor
 * @route   DELETE /api/donors/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        await Donor.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Donor deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
