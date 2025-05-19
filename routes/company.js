const express = require('express');
const router = express.Router();
const db = require('../db');
// const verifyToken = require('../middleware/auth'); // Uncomment to enable token protection

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Company management endpoints
 */

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: A list of all companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', (req, res) => {
  db.query('SELECT * FROM companies', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get a single company by ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A company object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM companies WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0]);
  });
});

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Add a new company
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Company created successfully
 */
router.post('/', (req, res) => {
  const { name, status } = req.body;
  db.query('INSERT INTO companies (name, status) VALUES (?, ?)', [name, status], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ id: result.insertId });
  });
});

/**
 * @swagger
 * /companies/{id}:
 *   put:
 *     summary: Update a company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Company updated successfully
 */
router.put('/:id', (req, res) => {
  const { name, status } = req.body;
  db.query('UPDATE companies SET name = ?, status = ? WHERE id = ?', [name, status, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Company updated successfully' });
  });
});

module.exports = router;
