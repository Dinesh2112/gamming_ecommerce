const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/product')); // 👈 Add this line
app.use('/api/cart', require('./routes/cart'));

app.get('/', (req, res) => {
  res.send('API is running... 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
