const mongoose = require('mongoose')

const musicSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    musicdata:{
        type: mongoose.Schema.Types.Mixed,
        require: true
    },
    url:{
        type:mongoose.Schema.Types.Mixed
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'folder',
    },
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('music', musicSchema)