const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    bloodGroup: {
        type: String,
        required: true,
        unique: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    availableUnits: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update lastUpdated on save
inventorySchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
