const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadImage } = require('../controllers/uploadController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const router = express.Router();

router.post('/', authMiddleware, upload.single('image'), uploadImage);

module.exports = router;
