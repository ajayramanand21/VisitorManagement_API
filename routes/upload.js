const express = require('express');
const router = express.Router();
const upload = require('../utils/upload'); 


router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
  }
  res.json({ filename: req.file.filename });
});

module.exports = router;
