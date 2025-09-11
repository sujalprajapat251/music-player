const path = require('path');

exports.uploadAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 400, message: 'No file uploaded' });
        }

        const host = req.get('host');
        const protocol = req.protocol;
        const relativePath = path.posix.join('uploads', req.file.fieldname, req.file.filename).replace(/\\/g, '/');
        const url = `${protocol}://${host}/${relativePath}`;

        return res.status(200).json({ status: 200, message: 'Audio uploaded', url, filename: req.file.filename });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};


