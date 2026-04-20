const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const morgan = require('morgan');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());  
 
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument  = YAML.load('./openapi.yaml')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB Connected!'))
.catch(err => console.error('❌ Connection error:', err));
 
app.get('/', (req, res) => {
res.send('API Quan ly Don hang dang hoat dong...');
});
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log(`🚀 Server is running on port ${PORT}`);
});

