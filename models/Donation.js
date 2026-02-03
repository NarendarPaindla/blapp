const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    donationDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    bloodGroup: {
        type: String,
        required: true
    },
    units: {
        type: Number,
        default: 1
    },
    location: {
        type: String
    },
    notes: {
        type: String
    }
});

module.exports = mongoose.model('Donation', donationSchema);
