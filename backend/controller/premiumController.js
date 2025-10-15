
const express = require('express');
const router = express.Router();
const Premium = require('../models/premiumModel');

const createPremium = async (req, res) => {
    try {
        let { amount, currency, premiumType, period, features } = req.body;
        console.log(req.body);


        // Validate required fields
        if (!amount || !premiumType || !period || !features || features.length === 0) {
            return res.status(400).json({
                success: false,
                message: ' amount, premiumType, period, and at least one feature are required'
            });
        }

        // Check if subscription with same name already exists
        // const existingSubscription = await Subscription.findOne({ name });
        // if (existingSubscription) {
        //     return res.status(409).json({
        //         success: false,
        //         message: 'A subscription with this name already exists'
        //     });
        // }

        // Create new subscription
        const premium = new Premium({
            amount,
            currency: currency || 'USD',
            premiumType,
            period,
            features,
        });


        // Save to database
        const savedpremium = await premium.save();
        console.log("premium", savedpremium);

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: savedpremium
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
        const premiums = await Premium.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: premiums.length,
            data: premiums
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
        const premium = await Premium.findById(req.params.id);

        if (!premium) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        res.status(200).json({
            success: true,
            data: premium
        });
    } catch (error) {
        console.error('Error fetching premium:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updatePremium = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, currency, premiumType, period, features } = req.body;
console.log('amount', amount, currency, premiumType, period, features,id);
        // Validate required fields
        
        if (!amount || !premiumType || !period || !features || features.length === 0) {
            return res.status(400).json({
                success: false,
                message: ' amount, premiumType, period, and at least one feature are required'
            })
        }
        const updatedPremium = await Premium.findByIdAndUpdate(id, {
            amount,
            currency: currency || 'USD',
            premiumType,
            period,
            features,
        }, { new: true });
        res.status(200).json({
            success: true,
            data: updatedPremium
        });
    } catch (error) {
        console.error('Error updating premium:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const deletePremium = async (req, res) => {
    try {
        const { id } = req.params;
        await Premium.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Subscription deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting premium:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
};

module.exports = {
    createPremium,
    getPremiums,
    getPremiumById,
    updatePremium,
    deletePremium
};
