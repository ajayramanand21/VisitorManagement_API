const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @swagger
 * tags:
 *   name: Designations
 *   description: API for managing designations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Designation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         company_id:
 *           type: integer
 *           example: 2
 *         department_id:
 *           type: integer
 *           example: 3
 *         name:
 *           type: string
 *           example: "Senior Developer"
 *         status:
 *           type: string
 *           enum: [Active, Inactive]
 *           example: Active
 *         company_name:
 *           type: string
 *           example: "Acme Corp"
 *         department_name:
 *           type: string
 *           example: "Engineering"
 */

/**
 * @swagger
 * /api/designations:
 *   get:
 *     summary: Get all designations with company and department names
 *     tags: [Designations]
 *     responses:
 *       200:
 *         description: List of designations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Designation'
 *       500:
 *         description: Server error
 */
router.get('/', (req, res) => {
  const sql = `
    SELECT d.*, c.name AS company_name, dept.name AS department_name
    FROM designations d
    JOIN companies c ON d.company_id = c.id
    JOIN departments dept ON d.department_id = dept.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/**
 * @swagger
 * /api/designations/{id}:
 *   get:
 *     summary: Get designation by ID
 *     tags: [Designations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Designation ID
 *     responses:
 *       200:
 *         description: Designation object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Designation'
 *       500:
 *         description: Server error
 */
router.get('/:id', (req, res) => {
  const sql = `SELECT * FROM designations WHERE id = ?`;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

/**
 * @swagger
 * /api/designations/departments/{companyId}:
 *   get:
 *     summary: Get active departments by company ID (for cascading dropdown)
 *     tags: [Designations]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company ID
 *     responses:
 *       200:
 *         description: List of active departments for the company
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get('/departments/:companyId', (req, res) => {
  const sql = `SELECT id, name FROM departments WHERE company_id = ? AND status = 'Active'`;
  db.query(sql, [req.params.companyId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/**
 * @swagger
 * /api/designations:
 *   post:
 *     summary: Add a new designation
 *     tags: [Designations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_id
 *               - department_id
 *               - name
 *               - status
 *             properties:
 *               company_id:
 *                 type: integer
 *                 example: 1
 *               department_id:
 *                 type: integer
 *                 example: 2
 *               name:
 *                 type: string
 *                 example: "Team Lead"
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 example: Active
 *     responses:
 *       200:
 *         description: Designation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *       500:
 *         description: Server error
 */
router.post('/', (req, res) => {
  const { company_id, department_id, name, status } = req.body;
  const sql = `INSERT INTO designations (company_id, department_id, name, status) VALUES (?, ?, ?, ?)`;
  db.query(sql, [company_id, department_id, name, status], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId });
  });
});

/**
 * @swagger
 * /api/designations/{id}:
 *   put:
 *     summary: Update an existing designation
 *     tags: [Designations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Designation ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_id
 *               - department_id
 *               - name
 *               - status
 *             properties:
 *               company_id:
 *                 type: integer
 *                 example: 1
 *               department_id:
 *                 type: integer
 *                 example: 2
 *               name:
 *                 type: string
 *                 example: "Senior Manager"
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 example: Active
 *     responses:
 *       200:
 *         description: Designation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Designation updated"
 *       500:
 *         description: Server error
 */
router.put('/:id', (req, res) => {
  const { company_id, department_id, name, status } = req.body;
  const sql = `UPDATE designations SET company_id = ?, department_id = ?, name = ?, status = ? WHERE id = ?`;
  db.query(sql, [company_id, department_id, name, status, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Designation updated' });
  });
});

module.exports = router;
