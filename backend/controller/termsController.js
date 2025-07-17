const Terms = require('../models/termsModel');

// Add new terms
exports.addTerms = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }
    const terms = new Terms({ title, description });
    await terms.save();
    res.status(201).json({ message: 'Terms added successfully', terms });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all terms
exports.getTerms = async (req, res) => {
  try {
    const terms = await Terms.find().sort({ createdAt: -1 });
    res.status(200).json(terms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
