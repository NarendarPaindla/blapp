const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Business Logic for Compatibility
const donorCompatibility = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
};

/**
 * @desc    Update User Profile (Become Donor or Update Info)
 * @route   PUT /api/users/profile
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        console.log('User found:', user ? user.constructor.name : 'null');

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            user.location = req.body.location || user.location;

            // Handle Donor Status
            if (req.body.isDonor !== undefined) {
                user.isDonor = req.body.isDonor;
                if (user.isDonor) {
                    // If becoming a donor, require these fields
                    if (req.body.bloodGroup) user.bloodGroup = req.body.bloodGroup;
                    if (req.body.lastDonationDate !== undefined) user.lastDonationDate = req.body.lastDonationDate;
                    if (req.body.availabilityStatus) user.availabilityStatus = req.body.availabilityStatus;
                }
            }

            // Just update other fields if provided
            if (req.body.bloodGroup) user.bloodGroup = req.body.bloodGroup;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isDonor: updatedUser.isDonor,
                role: updatedUser.role,
                token: req.headers.authorization.split(' ')[1] // return same token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Profile Update Error:', err);
        res.status(500).json({ message: err.message });
    }
});

/**
 * @desc    Search Compatible Donors
 * @route   GET /api/users/search/:bloodGroup
 * @access  Private (Registered Users Only)
 */
router.get('/search/:bloodGroup', protect, async (req, res) => {
    try {
        const patientGroup = req.params.bloodGroup;
        const compatibleDonorGroups = [];

        for (const [donorGroup, recipients] of Object.entries(donorCompatibility)) {
            if (recipients.includes(patientGroup)) {
                compatibleDonorGroups.push(donorGroup);
            }
        }

        if (compatibleDonorGroups.length === 0) {
            return res.json([]);
        }

        // Find users who are donors, compatible, and available
        const donors = await User.find({
            isDonor: true,
            bloodGroup: { $in: compatibleDonorGroups },
            availabilityStatus: 'Available'
        }).select('name bloodGroup location phone lastDonationDate availabilityStatus');
        // Explicitly select fields to return (Privacy)

        res.json(donors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @desc    Get aggregate donor counts (Public)
 * @route   GET /api/users/stats
 * @access  Public
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await User.aggregate([
            { $match: { isDonor: true, availabilityStatus: 'Available' } },
            { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }
        ]);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
