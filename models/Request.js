const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true,
        trim: true
    },
    requiredBloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    unitsRequired: {
        type: Number,
        required: true,
        min: 1
    },
    hospitalName: {
        type: String,
        required: true
    },
    urgencyLevel: {
        type: String,
        required: true,
        enum: ['Normal', 'Urgent', 'Critical'],
        default: 'Normal'
    },
    requestStatus: {
        type: String,
        enum: ['Pending', 'Fulfilled', 'Cancelled'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Request', requestSchema);
