const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    otp: {
        type: Number,
    },
    photo: {
        type: String,
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('user', userSchema)