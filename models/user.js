const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  linkedWhatsAppAccounts: [{ type: String, unique: true }], // Assuming phone numbers are unique
});

module.exports = mongoose.model('User', userSchema);