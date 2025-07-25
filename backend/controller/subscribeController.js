const subscribe = require('../models/subscribeModel');

exports.createSubscribe = async (req, res) => {
    try {
        const { email } = req.body;

        const existingSubscribe = await subscribe.findOne({ email });
        if (existingSubscribe) {
            return res.status(409).json({ status: 409, message: "Subscribe already exists." });
        }

        const newSubscribe = await subscribe.create({
            email
        });

        return res.status(200).json({
            status: 200,
            message: "Subscribe created successfully..!",
            Subscribe: newSubscribe,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getAllSubscribe = async (req, res) => {
    try {
        const subscribedata = await subscribe.find();
        if (!subscribedata || subscribedata.length === 0) {
            return res.status(404).json({ status: 404, message: "No subscribe found." });
        }
        return res.status(200).json({
            status: 200,
            message: "All Subscribe fetched successfully..!",
            subscribedata,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};


