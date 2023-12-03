// controllers/whatsappController.js

const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const User = require('../models/user');

// Store clients in memory (for simplicity, in a real-world scenario, you might want to use a database)
const clients = {};

// Function to create a new WhatsApp client for a user
const createClient = (userId) => {
    const sessionData = clients[userId] || null;
    return new Client({ session: sessionData });
};

const linkWhatsAppAccount = async (req, res) => {
    const { userId, phone } = req.body;

    try {
        // Create a new client for the user
        const client = createClient(userId);

        // Listen for QR code and session events
        client.on('qr', (qrCode) => {
            // Display QR code in the terminal
            qrcode.generate(qrCode, { small: true });
            res.json({ qrCode });
        });

        client.on('authenticated', (session) => {
            // Save the session data for the user
            clients[userId] = session;
        });

        // Connect to WhatsApp Web
        await client.initialize();

        // Save the linked WhatsApp account for the user
        await User.findOneAndUpdate({ _id: userId }, { $push: { linkedWhatsAppAccounts: phone } });

        res.json({ success: true, message: 'WhatsApp account linked successfully' });
    } catch (error) {
        console.error('Linking error:', error);
        res.status(500).json({ success: false, message: 'Error linking WhatsApp account' });
    }
};

const sendMessage = async (req, res) => {
    const { userId, phone, message, isImage } = req.body;

    try {
        // Create a new client for the user
        const client = createClient(userId);

        // Connect to WhatsApp Web
        await client.initialize();

        // Find the linked WhatsApp account
        const linkedAccount = await User.findOne({ _id: userId, linkedWhatsAppAccounts: phone });

        if (!linkedAccount) {
            return res.status(400).json({ success: false, message: 'Phone number not linked' });
        }

        // Send message
        if (isImage) {
            const media = MessageMedia.fromFilePath('/path/to/your/image.jpg');
            await client.sendMessage(phone, media, { caption: message });
        } else {
            await client.sendMessage(phone, message);
        }

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Sending message error:', error);
        res.status(500).json({ success: false, message: 'Error sending message' });
    }
};

// controllers/whatsappController.js

// const { Client, MessageMedia } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');
// const User = require('../models/user');

// // Function to create a new WhatsApp client for a user
// const createClient = (userId, sessionData) => {
//   return new Client({ session: sessionData });
// };

// const linkWhatsAppAccount = async (req, res) => {
//   const { userId, phone } = req.body;

//   try {
//     // Create a new client for the user
//     const client = createClient(userId);

//     // Listen for QR code and session events
//     client.on('qr', (qrCode) => {
//       // Display QR code in the terminal
//       qrcode.generate(qrCode, { small: true });
//       res.json({ qrCode });
//     });

//     client.on('authenticated', (session) => {
//       // Save the session data for the user
//       User.findOneAndUpdate({ _id: userId }, { $set: { sessionData: session } }, { upsert: true }, (err) => {
//         if (err) {
//           console.error('Error saving session data:', err);
//         }
//       });
//     });

//     // Connect to WhatsApp Web
//     await client.initialize();

//     // Save the linked WhatsApp account for the user
//     await User.findOneAndUpdate({ _id: userId }, { $push: { linkedWhatsAppAccounts: { phone, clientId: client._id } } });

//     res.json({ success: true, message: 'WhatsApp account linked successfully' });
//   } catch (error) {
//     console.error('Linking error:', error);
//     res.status(500).json({ success: false, message: 'Error linking WhatsApp account' });
//   }
// };

// const sendMessage = async (req, res) => {
//   const { userId, phone, message, isImage } = req.body;

//   try {
//     // Retrieve the session data from the database
//     const user = await User.findById(userId);

//     if (!user || !user.sessionData) {
//       return res.status(400).json({ success: false, message: 'Session data not found' });
//     }

//     // Create a new client for the user with the stored session data
//     const client = createClient(userId, user.sessionData);

//     // Connect to WhatsApp Web
//     await client.initialize();

//     // Find the linked WhatsApp account
//     const linkedAccount = user.linkedWhatsAppAccounts.find((acc) => acc.phone === phone);

//     if (!linkedAccount) {
//       return res.status(400).json({ success: false, message: 'Phone number not linked' });
//     }

//     // Send message
//     if (isImage) {
//       const media = MessageMedia.fromFilePath('/path/to/your/image.jpg');
//       await client.sendMessage(phone, media, { caption: message });
//     } else {
//       await client.sendMessage(phone, message);
//     }

//     res.json({ success: true, message: 'Message sent successfully' });
//   } catch (error) {
//     console.error('Sending message error:', error);
//     res.status(500).json({ success: false, message: 'Error sending message' });
//   }
// };

// module.exports = { linkWhatsAppAccount, sendMessage };


module.exports = { linkWhatsAppAccount, sendMessage }