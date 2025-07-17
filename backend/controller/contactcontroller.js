const Contact = require('../models/contactModel');

// Create a new contact message
exports.createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const contact = new Contact({ firstName, lastName, email, message });
    await contact.save();
    res.status(201).json({ message: 'Contact message sent successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};
