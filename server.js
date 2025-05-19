const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const db = require('./db'); 


dotenv.config();
const app = express();


app.use(cors());
// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VMS API',
      version: '1.0.0',
      description: 'Company API documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(bodyParser.json());


const companyRoutes = require('./routes/company');
const departmentRoutes = require('./routes/department');
const openRoutes = require('./routes/dropdown');
const designationRoutes = require('./routes/designation');
const employeeRoutes = require('./routes/employees');
const uploadRoutes = require('./routes/upload'); 



app.use('/api/employees', employeeRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/open', openRoutes);
app.use('/companies', companyRoutes); 
app.use('/api/departments', departmentRoutes);
app.use('/api', uploadRoutes);
// Root endpoint
app.get('/', (req, res) => {
  res.send('VMS API is running');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
