const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

const storage = multer.diskStorage({
  destination: config.fileUpload.fileUploadPath,
  filename(req, file, cb) {
    cb(null, `${file.originalname}`);
    // eslint-disable-next-line no-param-reassign
    file.originalname = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.fileUpload.maxFileSize }, // Limit maximum file size
  fileFilter: (req, file, cb) => {
    // Validating request contains an image file
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
});

module.exports = { upload };
