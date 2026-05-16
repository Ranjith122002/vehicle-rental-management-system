const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPG, PNG, WEBP images allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// @route POST /api/upload/vehicle-photo
router.post('/vehicle-photo', auth, role('owner', 'admin'), upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

module.exports = router;
