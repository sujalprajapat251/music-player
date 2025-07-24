const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['instrument', 'genre'],
        required: true
    },
});

module.exports = mongoose.model("Category", categorySchema);