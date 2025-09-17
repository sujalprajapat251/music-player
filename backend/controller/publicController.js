const Music = require('../models/musicModel');

exports.getMusicByIdPublic = async (req, res) => {
    try {
        const { id } = req.params;
        const music = await Music.findById(id).lean();
        if (!music || music.isDeleted) {
            return res.status(404).json({ status: 404, message: 'Project not found' });
        }
        return res.status(200).json({ status: 200, data: music });
    } catch (err) {
        return res.status(500).json({ status: 500, message: err.message });
    }
}; 