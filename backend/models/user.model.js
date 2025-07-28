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
    },
    mobile: {
        type: String,
    },
    gender: {
        type: String,
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sound',
    }],
    refreshToken:{
        type:String
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('user', userSchema)