const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department management APIs
 */

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments with company name
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: List of departments with company name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   company_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   status:
 *                     type: string
 *                   company_name:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get('/', (req, res) => {
  const sql = `
    SELECT d.*, c.name as company_name
    FROM departments d
    JOIN companies c ON d.company_id = c.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Department ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Department object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 company_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 status:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM departments WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Add a new department
 *     tags: [Departments]
 *     requestBody:
 *       description: Department data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_id
 *               - name
 *               - status
 *             properties:
 *               company_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *     responses:
 *       200:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *       500:
 *         description: Server error
 */
router.post('/', (req, res) => {
  const { company_id, name, status } = req.body;
  db.query('INSERT INTO departments (company_id, name, status) VALUES (?, ?, ?)', [company_id, name, status], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId });
  });
});

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Update department
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Department ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Updated department data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_id
 *               - name
 *               - status
 *             properties:
 *               company_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.put('/:id', (req, res) => {
  const { company_id, name, status } = req.body;
  db.query('UPDATE departments SET company_id = ?, name = ?, status = ? WHERE id = ?', [company_id, name, status, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Department updated' });
  });
});

module.exports = router;
