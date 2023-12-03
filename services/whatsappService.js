// services/whatsappService.js

const { Client, MessageMedia } = require('whatsapp-web.js');
const User = require('../models/user');
const LinkedAccount = require('../models/LinkedAccount');

const clients = {};

const initClient = async (user) => {
  try {
    // Check if the client is already initialized
    if (clients[user._id]) {
      return clients[user._id];
    }

    // Initialize a new WhatsApp client
    const client = new Client();
    clients[user._id] = client;

    // Event listener for when the client is ready
    client.on('qr', (qrCode, sessionId) => {
      // Implement logic to send the QR code to the client (e.g., display it on a webpage)
      console.log(`QR Code generated for session: ${sessionId}`);
      console.log(qrCode);
    });

    // Event listener for when the client is authenticated
    client.on('authenticated', (session) => {
      console.log(`Client authenticated for session: ${session}`);
    });

    // Event listener for when a message is received
    client.on('message', (message) => {
      // Implement logic to handle incoming messages
      console.log('Received message:', message.body);
    });

    // Connect to the WhatsApp server
    await client.initialize();

    return client;
  } catch (error) {
    console.error('Error initializing WhatsApp client:', error);
    throw error;
  }
};

const linkWhatsAppAccount = async (user, phoneNumber) => {
  try {
    // Initialize the WhatsApp client
    const client = await initClient(user);

    // Generate a QR code for the client to scan
    const qrCode = await client.generateInviteCode();

    // Save the linked account information to the database
    const linkedAccount = new LinkedAccount({
      phoneNumber,
      qrCode,
    });

    await linkedAccount.save();

    // Update the user's linkedAccounts array
    user.linkedAccounts.push(linkedAccount);

    // Save the user with the updated linkedAccounts array
    await user.save();

    return qrCode;
  } catch (error) {
    console.error('Error linking WhatsApp account:', error);
    throw error;
  }
};

const sendTextMessage = async (user, linkedAccountId, phoneNumber, message) => {
  try {
    // Initialize the WhatsApp client
    const client = await initClient(user);

    // Find the linked account
    const linkedAccount = await LinkedAccount.findById(linkedAccountId);

    if (!linkedAccount) {
      throw new Error('Linked account not found');
    }

    // Send the text message
    await client.sendMessage(`${phoneNumber}@c.us`, message);
  } catch (error) {
    console.error('Error sending text message:', error);
    throw error;
  }
};

const sendImageMessage = async (user, linkedAccountId, phoneNumber, imageUrl, caption) => {
  try {
    // Initialize the WhatsApp client
    const client = await initClient(user);

    // Find the linked account
    const linkedAccount = await LinkedAccount.findById(linkedAccountId);

    if (!linkedAccount) {
      throw new Error('Linked account not found');
    }

    // Download the image
    const media = MessageMedia.fromUrl(imageUrl);

    // Send the image message with caption
    await client.sendMessage(`${phoneNumber}@c.us`, media, { caption });
  } catch (error) {
    console.error('Error sending image message:', error);
    throw error;
  }
};

module.exports = { initClient, linkWhatsAppAccount, sendTextMessage, sendImageMessage }