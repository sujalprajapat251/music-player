const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    premiumType: {
        type: String,
        enum: ['basic', 'standard', 'advance'],
        required: true
    },
    period: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true
    },
    features: [{
        type: String,
        required: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);