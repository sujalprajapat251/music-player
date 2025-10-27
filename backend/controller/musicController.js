const mongoose = require('mongoose')
const Music = require('../models/musicModel');
const fs = require('fs');
const { notifyMusicUpdated } = require('../socketManager/socketManager');

// create music
exports.createMusic = async (req, res) => {
    try {
        const { name, musicdata, url, userId, folderId, drumRecordingClip, effectsData } = req.body;

        // Check if music with this name already exists
        const existingMusic = await Music.findOne({ name });
        
        if (existingMusic) {
            // Update existing music
            existingMusic.musicdata = musicdata || existingMusic.musicdata;
            existingMusic.url = url || existingMusic.url;
            existingMusic.userId = userId || existingMusic.userId;
            existingMusic.folderId = folderId || existingMusic.folderId;
            if (drumRecordingClip) {
                existingMusic.drumRecordingClip = drumRecordingClip;
            }
            // Update effects data if provided
            if (effectsData) {
                existingMusic.effectsData = effectsData;
            }

            const updatedMusic = await existingMusic.save();

            // Emit socket update to music-specific room
            notifyMusicUpdated(updatedMusic);

            return res.status(200).json({
                status: 200,
                message: "Music updated successfully..!",
                music: updatedMusic,
                isUpdate: true
            });
        } else {
            // Create new music
            const newMusicData = {
                name,
                musicdata,
                url,
                userId,
                folderId,
                drumRecordingClip
            };
            
            // Add effects data if provided
            if (effectsData) {
                newMusicData.effectsData = effectsData;
            }
            
            const newMusic = await Music.create(newMusicData);

            // Emit socket update to music-specific room
            notifyMusicUpdated(newMusic);

            return res.status(200).json({
                status: 200,
                message: "Music Saved successfully..!",
                music: newMusic,
                isUpdate: false
            });
        }
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
                    userId: new mongoose.Types.ObjectId(userId),
                    isDeleted: false // Only get non-deleted music
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


// get all deleted music by user id
exports.getDeletedMusic = async (req, res) => {
    try {
        const userId = req.user.id;

        const deletedMusic = await Music.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    isDeleted: true // Only get deleted music
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
            },
            {
                $sort: { deletedAt: -1 } // Sort by deletion date, most recent first
            }
        ]);
        
        return res.status(200).json({
            status: 200,
            message: "Deleted Music Files fetched successfully..!",
            music: deletedMusic,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};
exports.getSingleMusic = async (req,res)=>{
    try{
        const musicId = useParam;
        let musicdata = await Music.findById(musicId)
    }
    catch(error){
        return res.status(500).json({ status: 500, message: error.message });
    }
}

// update music
exports.updateMusic = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, musicdata, url, folderId, effectsData } = req.body;

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
        
        // Update effects data if provided
        if (effectsData !== undefined) {
            existingMusic.effectsData = effectsData;
        }

        const updatedMusic = await existingMusic.save();

        // Emit socket update to music-specific room
        notifyMusicUpdated(updatedMusic);

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
            return res.status(400).json({ status: 400, message: "Name is required" });
        }

        const music = await Music.findByIdAndUpdate(
            id,
            { name: name },
            { new: true }
        );

        if (!music) {
            return res.status(404).json({ status: 404, message: "Music file not found" });
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
            return res.status(400).json({ status: 400, message: "FolderId is required" });
        }

        const music = await Music.findByIdAndUpdate(
            id,
            { folderId: folderId },
            { new: true }
        );

        if (!music) {
            return res.status(404).json({ status: 404, message: "Music file not found" });
        }

        res.status(200).json({
            message: "Music file moved successfully..!",
            music
        });
    } catch (error) {
        res.status(500).json({ status: 500, error: error.message });
    }
};

// Add Cover Image
exports.addCoverImage = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ status: 400, message: "No file uploaded" });
        }

        const coverPath = req.file.path;

        const music = await Music.findByIdAndUpdate(
            id,
            { image: coverPath },
            { new: true }
        );

        if (!music) {
            return res.status(404).json({ status: 404, message: "Music not found" });
        }

        res.status(200).json({ status: 200, message: "Cover image added successfully..!", data: music });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

// Remove Cover Image
exports.removeCoverImage = async (req, res) => {
    try {
        const { id } = req.params;
        const music = await Music.findById(id);

        if (!music) {
            return res.status(404).json({ status: 404, message: "Music not found" });
        }

        if (music.image) {
            fs.unlink(music.image, (err) => {
                if (err) console.log("File deletion error:", err.message);
            });
        }

        music.image = null;
        await music.save();

        res.status(200).json({ status: 200, message: "Cover image removed successfully..!", data: music });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

// Update Effect Parameters
exports.updateEffectParameters = async (req, res) => {
    try {
        const { id } = req.params;
        const { effectsData } = req.body;

        const music = await Music.findById(id);
        if (!music) {
            return res.status(404).json({ status: 404, message: "Music not found" });
        }

        // Update only effects data
        music.effectsData = effectsData;
        await music.save();

        res.status(200).json({ 
            status: 200, 
            message: "Effect parameters updated successfully!", 
            music: music 
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};




