const Payment = require('../models/paymentModel');
const Premium = require('../models/premiumModel'); // Assuming premium model exists
const User = require('../models/user.model'); // Assuming user model exists

// Controller to confirm payment and save to database
const confirmPayment = async (req, res) => {
  try {
    const { planId, cardHolder, period, startDate, endDate, amount, userId } = req.body;

    // Validate required fields
    if (!planId || !cardHolder || !period || !startDate || !endDate || !amount || !userId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate period
    if (!['month', 'year'].includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Period must be either "month" or "year"'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Check if plan exists
    const plan = await Premium.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Premium plan not found'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create new payment record
    const payment = new Payment({
      planId,
      cardHolder,
      period,
      startDate,
      endDate,
      amount,
      userId
    });

    // Save to database
    const savedPayment = await payment.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: savedPayment
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Payment already exists'
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  confirmPayment
};