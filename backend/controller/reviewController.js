const mongoose = require('mongoose');
const Review = require('../models/reviewModel');
const Music = require('../models/musicModel');
const User = require('../models/user.model');

// Create a new review
const createReview = async (req, res) => {
    try {
        const { musicId, rating, description } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!musicId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Music ID and rating are required'
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if music exists
        const music = await Music.findById(musicId);
        if (!music) {
            return res.status(404).json({
                success: false,
                message: 'Music not found'
            });
        }

        // Get user details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user already reviewed this music
        const existingReview = await Review.findOne({ userId, musicId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this music'
            });
        }

        // Create new review
        const review = new Review({
            userId,
            musicId,
            rating,
            description: description || '',
            userName: user.name || user.email,
            userEmail: user.email
        });

        await review.save();

        // Calculate average rating for the music
        await calculateAverageRating(musicId);

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: review
        });

    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all reviews for a specific music
const getReviewsByMusicId = async (req, res) => {
    try {
        const { musicId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Validate musicId
        if (!musicId) {
            return res.status(400).json({
                success: false,
                message: 'Music ID is required'
            });
        }

        // Check if music exists
        const music = await Music.findById(musicId);
        if (!music) {
            return res.status(404).json({
                success: false,
                message: 'Music not found'
            });
        }

        // Get reviews with pagination
        const reviews = await Review.find({ musicId })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Get total count for pagination
        const totalReviews = await Review.countDocuments({ musicId });

        // Calculate average rating
        const avgRating = await Review.aggregate([
            { $match: { musicId: mongoose.Types.ObjectId(musicId) } },
            { $group: { _id: null, averageRating: { $avg: '$rating' } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                reviews,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalReviews / limit),
                    totalReviews,
                    hasNextPage: page < Math.ceil(totalReviews / limit),
                    hasPrevPage: page > 1
                },
                averageRating: avgRating.length > 0 ? avgRating[0].averageRating : 0
            }
        });

    } catch (error) {
        console.error('Error getting reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all reviews by a specific user
const getReviewsByUserId = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const reviews = await Review.find({ userId })
            .populate('musicId', 'name url')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const totalReviews = await Review.countDocuments({ userId });

        res.status(200).json({
            success: true,
            data: {
                reviews,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalReviews / limit),
                    totalReviews,
                    hasNextPage: page < Math.ceil(totalReviews / limit),
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error getting user reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update a review
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, description } = req.body;
        const userId = req.user.id;

        // Find the review
        const review = await Review.findOne({ _id: reviewId, userId });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found or you are not authorized to update it'
            });
        }

        // Update review
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }
            review.rating = rating;
        }

        if (description !== undefined) {
            review.description = description;
        }

        await review.save();

        // Recalculate average rating for the music
        await calculateAverageRating(review.musicId);

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: review
        });

    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await Review.findOne({ _id: reviewId, userId });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found or you are not authorized to delete it'
            });
        }

        const musicId = review.musicId;
        await Review.findByIdAndDelete(reviewId);

        // Recalculate average rating for the music
        await calculateAverageRating(musicId);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Helper function to calculate average rating
const calculateAverageRating = async (musicId) => {
    try {
        const result = await Review.aggregate([
            { $match: { musicId: mongoose.Types.ObjectId(musicId) } },
            { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
        ]);

        if (result.length > 0) {
            await Music.findByIdAndUpdate(musicId, {
                averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal place
                totalReviews: result[0].totalReviews
            });
        }
    } catch (error) {
        console.error('Error calculating average rating:', error);
    }
};

module.exports = {
    createReview,
    getReviewsByMusicId,
    getReviewsByUserId,
    updateReview,
    deleteReview
};
