const mongoose = require('mongoose')
const Music = require('../models/musicModel');

exports.createMusic = async (req, res) => {
    try {
        const { name, musicdata, url, userId, folderId } = req.body;

        const existingmusic = await Music.findOne({ name });
        if (existingmusic) {
            return res.status(409).json({ status: 409, message: "Music Name already exists." });
        }

        const newMusic = await Music.create({
            name,
            musicdata,
            url,
            userId,
            folderId,
        });

        return res.status(200).json({
            status: 200,
            message: "Music Saved successfully..!",
            music: newMusic,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getAllMusic = async (req, res) => {
    try {
        const userId = req.user.id; 
        
        const music = await Music.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'newfolders',
                    localField: 'folderId',
                    foreignField: '_id',
                    as: 'folder'
                }
            }
        ]);
        if (!music || music.length === 0) {
            return res.status(404).json({ status: 404, message: "No music file found." });
        }
        return res.status(200).json({
            status: 200,
            message: "All Music File fetched successfully..!",
            music,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};