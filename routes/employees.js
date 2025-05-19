const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/employees/'), // Ensure folder exists
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: API for managing employees
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         first_name:
 *           type: string
 *           example: John
 *         last_name:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           example: john.doe@example.com
 *         phone:
 *           type: string
 *           example: 1234567890
 *         joining_date:
 *           type: string
 *           format: date
 *           example: 2023-05-01
 *         gender:
 *           type: string
 *           enum: [Male, Female, Other]
 *           example: Male
 *         company_id:
 *           type: integer
 *           example: 1
 *         department_id:
 *           type: integer
 *           example: 2
 *         designation_id:
 *           type: integer
 *           example: 3
 *         status:
 *           type: string
 *           enum: [Active, Inactive]
 *           example: Active
 *         remarks:
 *           type: string
 *           example: "Good employee"
 *         image:
 *           type: string
 *           example: "uploads/employees/123456789.jpg"
 */

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees with company, department, and designation names
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Employee'
 *                   - type: object
 *                     properties:
 *                       company_name:
 *                         type: string
 *                         example: Acme Corp
 *                       department_name:
 *                         type: string
 *                         example: Engineering
 *                       designation_name:
 *                         type: string
 *                         example: Senior Developer
 *       500:
 *         description: Server error
 */
router.get('/', (req, res) => {
  const sql = `
    SELECT e.*, c.name AS company_name, d.name AS department_name, des.name AS designation_name
    FROM employees e
    JOIN companies c ON e.company_id = c.id
    JOIN departments d ON e.department_id = d.id
    JOIN designations des ON e.designation_id = des.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       500:
 *         description: Server error
 */
router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM employees WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Add a new employee
 *     tags: [Employees]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - confirm_password
 *               - company_id
 *               - department_id
 *               - designation_id
 *               - status
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               joining_date:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               company_id:
 *                 type: integer
 *               department_id:
 *                 type: integer
 *               designation_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *               password:
 *                 type: string
 *               confirm_password:
 *                 type: string
 *               remarks:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 7
 *       400:
 *         description: Passwords do not match
 *       500:
 *         description: Server error
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      joining_date,
      gender,
      company_id,
      department_id,
      designation_id,
      status,
      password,
      confirm_password,
      remarks
    } = req.body;

    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const image = req.file ? req.file.path.replace(/\\/g, "/") : null;

    const sql = `INSERT INTO employees 
      (first_name, last_name, email, phone, joining_date, gender, company_id, department_id, designation_id, status, password, remarks, image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      first_name,
      last_name,
      email,
      phone,
      joining_date,
      gender,
      company_id,
      department_id,
      designation_id,
      status,
      hashedPassword,
      remarks,
      image
    ];

    db.query(sql, values, (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId });
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Update an employee
 *     tags: [Employees]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               joining_date:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               company_id:
 *                 type: integer
 *               department_id:
 *                 type: integer
 *               designation_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *               password:
 *                 type: string
 *               confirm_password:
 *                 type: string
 *               remarks:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       400:
 *         description: Passwords do not match
 *       500:
 *         description: Server error
 */
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      joining_date,
      gender,
      company_id,
      department_id,
      designation_id,
      status,
      password,
      confirm_password,
      remarks
    } = req.body;

    if (password && password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const fields = [
      'first_name', 'last_name', 'email', 'phone', 'joining_date',
      'gender', 'company_id', 'department_id', 'designation_id',
      'status', 'remarks'
    ];
    let updates = [];
    let values = [];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (req.file) {
      const imagePath = req.file.path.replace(/\\/g, "/");
      updates.push('image = ?');
      values.push(imagePath);
    }

    values.push(id);

    const sql = `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`;

    db.query(sql, values, (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Employee updated successfully' });
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       500:
 *         description: Server error
 */
router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM employees WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Employee deleted successfully' });
  });
});

//Dropwndowns company>deparment>designation
// Get all departments for a specific company
router.get('/departments/:companyId', (req, res) => {
  const { companyId } = req.params;
  const sql = 'SELECT * FROM departments WHERE company_id = ?';

  db.query(sql, [companyId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/**
 * @swagger
 * /api/employees/departments/{companyId}:
 *   get:
 *     summary: Get all departments for a specific company
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company ID
 *     responses:
 *       200:
 *         description: List of departments
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
 *                   company_id:
 *                     type: integer
 *       500:
 *         description: Server error
 */

// Get all designations for a specific department
router.get('/designations/:departmentId', (req, res) => {
  const { departmentId } = req.params;
  const sql = 'SELECT * FROM designations WHERE department_id = ?';

  db.query(sql, [departmentId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/**
 * @swagger
 * /api/employees/designations/{departmentId}:
 *   get:
 *     summary: Get all designations for a specific department
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: List of designations
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
 *                   department_id:
 *                     type: integer
 *       500:
 *         description: Server error
 */


module.exports = router;
