const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'realestate',
    allowed_formats: ['jpg', 'png'],
  },
});

module.exports = multer({ storage });
