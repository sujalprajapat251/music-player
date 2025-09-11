const mongoose = require('mongoose')
const Music = require('../models/musicModel');

// create music
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

// get all music by user id
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

// update music
exports.updateMusic = async (req, res) => {
    try {
        const { id } = req.params; 
        const { name, musicdata, url, folderId } = req.body;

        const existingMusic = await Music.findById(id);
        if (!existingMusic) {
            return res.status(404).json({ status: 404, message: "Music not found." });
        }

        if (name && name !== existingMusic.name) {
            const duplicate = await Music.findOne({ name });
            if (duplicate) {
                return res.status(409).json({ status: 409, message: "Music name already exists." });
            }
        }

        existingMusic.name = name || existingMusic.name;
        existingMusic.musicdata = musicdata || existingMusic.musicdata;
        existingMusic.url = url || existingMusic.url;
        existingMusic.folderId = folderId || existingMusic.folderId;

        const updatedMusic = await existingMusic.save();

        return res.status(200).json({
            status: 200,
            message: "Music updated successfully..!",
            music: updatedMusic,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

// delete music ( move to recycle bin )
exports.deleteMusic = async (req, res) => {
    try {
        const { id } = req.params;

        const music = await Music.findById(id);
        if (!music) {
            return res.status(404).json({ status: 404, message: "Music not found." });
        }

        // Already in recycle bin?
        if (music.isDeleted) {
            return res.status(400).json({ status: 400, message: "Music already in recycle bin." });
        }

        music.isDeleted = true;
        music.deletedAt = new Date();
        await music.save();

        return res.status(200).json({ status: 200, message: "Music moved to recycle bin." });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

// restore music from recycle bin
exports.restoreMusic = async (req, res) => {
    try {
        const { id } = req.params;

        const music = await Music.findById(id);
        if (!music || !music.isDeleted) {
            return res.status(404).json({ status: 404, message: "Music not found in recycle bin." });
        }

        music.isDeleted = false;
        music.deletedAt = null;
        await music.save();

        return res.status(200).json({ status: 200, message: "Music restored successfully!" });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

// permanently delete music
exports.permanentDeleteMusic = async (req, res) => {
    try {
        const { id } = req.params;

        const music = await Music.findById(id);
        if (!music) {
            return res.status(404).json({ status: 404, message: "Music not found." });
        }

        await Music.findByIdAndDelete(id);

        return res.status(200).json({ status: 200, message: "Music permanently deleted!" });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};


// restore all music from recycle bin
exports.restoreAllMusic = async (req, res) => {
    try {
        const userId = req.user.id; 
        const result = await Music.updateMany(
            { userId, isDeleted: true },
            { $set: { isDeleted: false, deletedAt: null } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ status: 404, message: "No music files in recycle bin." });
        }

        return res.status(200).json({
            status: 200,
            message: "All music files restored successfully.!",
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

// permanently delete all music from recycle bin
exports.permanentDeleteAllMusic = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await Music.deleteMany({ userId, isDeleted: true });

        if (result.deletedCount === 0) {
            return res.status(404).json({ status: 404, message: "No music files found in recycle bin." });
        }

        return res.status(200).json({
            status: 200,
            message: "All music files permanently deleted..!",
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

// Rename music file
exports.renameMusic = async (req, res) => {
    try {
        const { id } = req.params; 
        const { name } = req.body; 

        if (!name || name.trim() === "") {
            return res.status(400).json({ status: 400,message: "Name is required" });
        }

        const music = await Music.findByIdAndUpdate(
            id,
            { name: name },
            { new: true } 
        );

        if (!music) {
            return res.status(404).json({ status: 404,message: "Music file not found" });
        }

        res.status(200).json({
            message: "Music file renamed successfully..!",
            music
        });
    } catch (error) {
        res.status(500).json({ status: 500, error: error.message });
    }
};

// Move the Folder
exports.moveMusicToFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { folderId } = req.body; 

        if (!folderId) {
            return res.status(400).json({ status: 400,message: "FolderId is required" });
        }

        const music = await Music.findByIdAndUpdate(
            id,
            { folderId: folderId },
            { new: true } 
        );

        if (!music) {
            return res.status(404).json({ status: 404,message: "Music file not found" });
        }

        res.status(200).json({
            message: "Music file moved successfully..!",
            music
        });
    } catch (error) {
        res.status(500).json({ status: 500, error: error.message });
    }
};




