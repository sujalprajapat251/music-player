const mongoose = require('mongoose')

const musicSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    musicdata: {
        type: mongoose.Schema.Types.Mixed,
        require: true
    },
    url: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'folder',
    },
    image: {  
        type: String,
        default: null
    },
    effectsData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    drumRecordingClip: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('music', musicSchema)