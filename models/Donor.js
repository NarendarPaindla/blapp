const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true
    },
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    phone: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Please fill a valid phone number']
    },
    location: {
        type: String,
        required: true
    },
    lastDonationDate: {
        type: Date,
        default: null
    },
    availabilityStatus: {
        type: String,
        enum: ['Available', 'Unavailable'],
        default: 'Available'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Donor', donorSchema);
