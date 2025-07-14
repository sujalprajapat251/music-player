const Sound = require('../models/soundModel');

exports.createSound = async (req, res) => {
    try {
        const { soundname, soundtype } = req.body;

        const soundfile = req.files && req.files.soundfile ? req.files.soundfile[0].filename : null;
        const image = req.files && req.files.image ? req.files.image[0].filename : null;

        const existingSound = await Sound.findOne({ soundname });
        if (existingSound) {
            return res.status(409).json({ status: 409, message: "Sound already exists." });
        }

        const newSound = await Sound.create({
            soundname,
            soundtype,
            soundfile,
            image,
        });

        return res.status(200).json({
            status: 200,
            message: "Sound created successfully..!",
            sound: newSound,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getAllSounds = async (req, res) => {
    try {
        const sounds = await Sound.find();
        if (!sounds || sounds.length === 0) {
            return res.status(404).json({ status: 404, message: "No sounds found." });
        }
        return res.status(200).json({
            status: 200,
            totalSounds: sounds.length,
            message: "All sounds fetched successfully..!",
            sounds,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getSoundById = async (req, res) => {
    try {
        const sound = await Sound.findById(req.params.id);
        if (!sound) {
            return res.status(404).json({ status: 404, message: "Sound not found." });
        }
        return res.status(200).json({
            status: 200,
            message: "Sound fetched successfully.,.!",
            sound,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.updateSound = async (req, res) => {
    try {
        const { soundname, soundtype } = req.body;
        let updateData = { soundname, soundtype };
        if (req.files && req.files.soundfile) {
            updateData.soundfile = req.files.soundfile[0].filename;
        }
        if (req.files && req.files.image) {
            updateData.image = req.files.image[0].filename;
        }
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        const updatedSound = await Sound.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!updatedSound) {
            return res.status(404).json({ status: 404, message: "Sound not found." });
        }
        return res.status(200).json({
            status: 200,
            message: "Sound updated successfully..!",
            sound: updatedSound,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.deleteSound = async (req, res) => {
    try {
        const sound = await Sound.findById(req.params.id);
        if (!sound) {
            return res.status(404).json({ status: 404, message: "Sound not found." });
        }
        await Sound.findByIdAndDelete(req.params.id);
        return res.status(200).json({ status: 200, message: "Sound deleted successfully..!" });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

