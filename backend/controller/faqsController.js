const Faq = require('../models/faqsModel');

// Get all FAQs
exports.getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find();
    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new FAQ
exports.createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required.' });
    }
    const faq = new Faq({ question, answer });
    await faq.save();
    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
