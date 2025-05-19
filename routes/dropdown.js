const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @swagger
 * tags:
 *   name: OpenData
 *   description: APIs to fetch dropdown data like companies and departments
 */

/**
 * @swagger
 * /api/open/companies:
 *   get:
 *     summary: Get all active companies for dropdown
 *     tags: [OpenData]
 *     responses:
 *       200:
 *         description: List of active companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Vega Intellisoft"
 *       500:
 *         description: Server error
 */
router.get('/companies', (req, res) => {
  db.query('SELECT id, name FROM companies WHERE status = "Active"', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/**
 * @swagger
 * /api/open/departments:
 *   get:
 *     summary: Get all active departments for dropdown
 *     tags: [OpenData]
 *     responses:
 *       200:
 *         description: List of active departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 10
 *                   name:
 *                     type: string
 *                     example: "HR"
 *       500:
 *         description: Server error
 */
router.get('/departments', (req, res) => {
  db.query('SELECT id, name FROM departments WHERE status = "Active"', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

module.exports = router;
