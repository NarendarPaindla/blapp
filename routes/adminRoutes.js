const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Request = require('../models/Request');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

// Protect all routes
router.use(protect);
router.use(admin);

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 */
router.get('/users', async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 */
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @desc    Update Inventory
 * @route   PUT /api/admin/inventory
 */
router.put('/inventory', async (req, res) => {
    const { bloodGroup, quantity, operation } = req.body;
    // ... Logic reuse or import from controller ...
    // For brevity, inline update:
    try {
        let item = await Inventory.findOne({ bloodGroup });
        if (!item && operation === 'add') {
            item = new Inventory({ bloodGroup, availableUnits: quantity });
        } else if (item) {
            if (operation === 'add') item.availableUnits += parseInt(quantity);
            else item.availableUnits = Math.max(0, item.availableUnits - parseInt(quantity));
        } else {
            return res.status(404).json({ message: 'Not found' });
        }
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
