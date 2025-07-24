const mongoose = require('mongoose')

const soundSchema = mongoose.Schema({
    soundname: {
        type: String,
        require: true
    },
    soundtype: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
    },
    soundfile: {
        type: String,
    },
    image: {
        type: String,
    },
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('sound', soundSchema)