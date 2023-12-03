// routes/whatsappRoutes.js

const express = require('express');
const router = express.Router();
const { linkWhatsAppAccount, sendMessage } = require('../controllers/whatsappController');
const { login } = require('../controllers/userController')
// Link WhatsApp account route
router.post('/link', linkWhatsAppAccount);
// Send message route
router.post('/send-message', sendMessage);
router.post('/login', login )

module.exports = router;
