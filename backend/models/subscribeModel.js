const mongoose = require('mongoose')

const subscribeSchema = mongoose.Schema({
    email: {
        type: String,
        require: true
    },
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('subscribe', subscribeSchema)