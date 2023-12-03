// app.js

const express = require('express');
const mongoose = require('mongoose');

const whatsappRoutes = require('./routes/whatsappRoutes');

const app = express();

app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:5000/testWp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Use WhatsApp routes
app.use('/whatsapp', whatsappRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
