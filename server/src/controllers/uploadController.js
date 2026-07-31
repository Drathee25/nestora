const cloudinary = require('../lib/cloudinary');

function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const stream = cloudinary.uploader.upload_stream(
    { folder: 'real-estate-listings' },
    (error, result) => {
      if (error) return res.status(500).json({ error: 'Upload failed' });
      res.json({ url: result.secure_url });
    }
  );
  stream.end(req.file.buffer);
}

module.exports = { uploadImage };
