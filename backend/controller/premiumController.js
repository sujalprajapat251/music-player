
const express = require('express');
const router = express.Router();
const premium = require('../models/premiumModel');

const createPremium = async (req, res) => {
    try {
        const { name, amount, currency, premiumType, period, features, description, isBestValue } = req.body;

        // Validate required fields
        if (!name || !amount || !premiumType || !period || !features || features.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Name, amount, premiumType, period, and at least one feature are required'
            });
        }

        // Check if subscription with same name already exists
        const existingSubscription = await Subscription.findOne({ name });
        if (existingSubscription) {
            return res.status(409).json({
                success: false,
                message: 'A subscription with this name already exists'
            });
        }

        // Create new subscription
        const subscription = new Subscription({
            name,
            amount,
            currency: currency || 'USD',
            premiumType,
            period,
            features,
            description,
            isBestValue: isBestValue || false
        });

        // Save to database
        const savedSubscription = await subscription.save();

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: savedSubscription
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get all subscriptions
const getPremiums = async (req, res) => {
    try {
        const subscriptions = await Subscription.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: subscriptions.length,
            data: subscriptions
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get subscription by ID
const getPremiumById = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        res.status(200).json({
            success: true,
            data: subscription
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Export the functions
module.exports = {
    createPremium,
    getPremiums,
    getPremiumById
};
