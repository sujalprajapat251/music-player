const multer = require("multer");
const path = require("path");
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderName = file.fieldname;
    const uploadPath = path.join('uploads', folderName);

    fs.mkdir(uploadPath, { recursive: true }, function (err) {
      if (err) {
        return cb(err);
      }
      cb(null, uploadPath);
    });
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replaceAll(' ', '')}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = "*/*";
  if (true) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }

  // if (allowedTypes.includes(file.mimetype)) {
  //   cb(null, true);
  // } else {
  //   cb(new Error("Invalid file type"), false);
  // }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 600 * 1024 * 1024, // 600MB limit
  },
});

module.exports = upload;  