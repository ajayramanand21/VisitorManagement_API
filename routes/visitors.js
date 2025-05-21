const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');
const db = require('../db');

// Multer config for file uploads (images)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Visitors
 *   description: Visitor management endpoints
 */

/**
 * @swagger
 * /api/visitors:
 *   get:
 *     summary: Get all visitors
 *     tags: [Visitors]
 *     responses:
 *       200:
 *         description: List of all visitors
 */
router.get('/', (req, res) => {
  db.query('SELECT * FROM visitors', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

/**
 * @swagger
 * /api/visitors/{id}:
 *   get:
 *     summary: Get visitor by ID
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Visitor data
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM visitors WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
});

/**
 * @swagger
 * /api/visitors:
 *   post:
 *     summary: Add new visitor
 *     tags: [Visitors]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               gender: { type: string, enum: [Male, Female, Other] }
 *               company_id: { type: integer }
 *               department_id: { type: integer }
 *               designation_id: { type: integer }
 *               whom_to_meet: { type: integer }
 *               purpose: { type: string }
 *               aadhar_no: { type: string }
 *               address: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Visitor added with QR
 */
router.post('/', upload.single('image'), async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    gender,
    company_id,
    department_id,
    designation_id,
    whom_to_meet,
    purpose,
    aadhar_no,
    address
  } = req.body;

  const image = req.file?.filename || null;

  const sql = `
    INSERT INTO visitors (
      first_name, last_name, email, phone, gender,
      company_id, department_id, designation_id, whom_to_meet,
      purpose, aadhar_no, address, image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    first_name, last_name, email, phone, gender,
    company_id, department_id, designation_id, whom_to_meet,
    purpose, aadhar_no, address, image
  ];

  db.query(sql, values, async (err, result) => {
    if (err) return res.status(500).send(err);
    const visitorId = result.insertId;
    const qrText = `http://localhost:3001/api/visitors/signout/${visitorId}`;
    const qrDataURL = await QRCode.toDataURL(qrText);
    res.json({ visitorId, qr: qrDataURL });
  });
});

/**
 * @swagger
 * /api/visitors/{id}:
 *   put:
 *     summary: Update visitor
 *     tags: [Visitors]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               gender: { type: string }
 *               company_id: { type: integer }
 *               department_id: { type: integer }
 *               designation_id: { type: integer }
 *               whom_to_meet: { type: integer }
 *               purpose: { type: string }
 *               aadhar_no: { type: string }
 *               address: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Visitor updated
 */
router.put('/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    phone,
    gender,
    company_id,
    department_id,
    designation_id,
    whom_to_meet,
    purpose,
    aadhar_no,
    address
  } = req.body;

  const image = req.file?.filename;

  let sql = `
    UPDATE visitors SET
      first_name = ?, last_name = ?, email = ?, phone = ?, gender = ?,
      company_id = ?, department_id = ?, designation_id = ?, whom_to_meet = ?,
      purpose = ?, aadhar_no = ?, address = ?
  `;
  const values = [
    first_name, last_name, email, phone, gender,
    company_id, department_id, designation_id, whom_to_meet,
    purpose, aadhar_no, address
  ];

  if (image) {
    sql += `, image = ?`;
    values.push(image);
  }

  sql += ` WHERE id = ?`;
  values.push(id);

  db.query(sql, values, (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Visitor updated successfully' });
  });
});

/**
 * @swagger
 * /api/visitors/{id}/status:
 *   put:
 *     summary: Toggle visitor status
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Status toggled
 */
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE visitors SET status = NOT status WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Status toggled' });
  });
});

/**
 * @swagger
 * /api/visitors/{id}/card:
 *   get:
 *     summary: Generate QR card for visitor
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: QR code as base64 image
 */
router.get('/:id/card', (req, res) => {
  const { id } = req.params;
  const qrText = `http://localhost:3001/api/visitors/signout/${id}`;
  QRCode.toDataURL(qrText, (err, qr) => {
    if (err) return res.status(500).send(err);
    res.json({ qr });
  });
});

/**
 * @swagger
 * /api/visitors/signout/{id}:
 *   get:
 *     summary: Sign out visitor via QR
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       200:
 *         description: Visitor signed out
 */
router.get('/signout/:id', (req, res) => {
  const { id } = req.params;
db.query("UPDATE visitors SET qr_status = 'used' WHERE id = ?", [id], (err) => {
  if (err) return res.status(500).send(err);
  res.send(`<h2>Visitor ID ${id} signed out successfully. QR is now invalid.</h2>`);
});

});

module.exports = router;
