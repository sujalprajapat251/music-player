const mongoose = require('mongoose')

const soundSchema = mongoose.Schema({
    soundname: {
        type: String,
        require: true
    },
    soundtype: {
        type: String,
        require: true
    },
    soundfile: {
        type: String,
    },
    image: {
        type: String,
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('sound', soundSchema)