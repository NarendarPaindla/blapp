const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

/**
 * @desc    Get inventory status
 * @route   GET /api/inventory
 */
router.get('/', async (req, res) => {
    try {
        const inventory = await Inventory.find();
        res.status(200).json(inventory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @desc    Update inventory (add/remove units)
 * @route   PUT /api/inventory/update
 */
router.put('/update', async (req, res) => {
    try {
        const { bloodGroup, quantity, operation } = req.body;
        // operation: 'add' or 'subtract'

        let inventoryItem = await Inventory.findOne({ bloodGroup });

        if (!inventoryItem) {
            // Create if doesn't exist (only for 'add')
            if (operation === 'add') {
                inventoryItem = new Inventory({
                    bloodGroup,
                    availableUnits: quantity
                });
            } else {
                return res.status(404).json({ message: 'Blood group inventory not found' });
            }
        } else {
            if (operation === 'add') {
                inventoryItem.availableUnits += parseInt(quantity);
            } else if (operation === 'subtract') {
                if (inventoryItem.availableUnits < quantity) {
                    return res.status(400).json({ message: 'Insufficient units' });
                }
                inventoryItem.availableUnits -= parseInt(quantity);
            }
        }

        const savedItem = await inventoryItem.save();
        res.status(200).json(savedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Initialize inventory with 0 for all groups if empty (Helper route, optional)
router.post('/init', async (req, res) => {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    try {
        for (const group of bloodGroups) {
            const exists = await Inventory.findOne({ bloodGroup: group });
            if (!exists) {
                await new Inventory({ bloodGroup: group, availableUnits: 0 }).save();
            }
        }
        res.status(200).send('Inventory initialized');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
