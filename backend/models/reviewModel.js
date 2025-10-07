const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    musicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Music',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    description: {
        type: String,
        maxlength: 1000,
        default: ''
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
reviewSchema.index({ musicId: 1, userId: 1 });
reviewSchema.index({ musicId: 1, createdAt: -1 });

// Prevent duplicate reviews from same user for same music
reviewSchema.index({ musicId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
