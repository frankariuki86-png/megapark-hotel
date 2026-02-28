const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { sendEmail } = require('../services/emailService');
const mpesaService = require('../services/mpesaService');

module.exports = ({ logger, readJSON, writeJSON, bookingsPath, pgClient }) => {
  // Initiate M-Pesa STK Push (simulated if Daraja not configured)
  router.post('/mpesa/initiate', async (req, res) => {
    try {
      const { phoneNumber, amount, accountName, orderId } = req.body;
      if (!phoneNumber || !amount) return res.status(400).json({ error: 'phoneNumber and amount required' });

      const result = await mpesaService.initiateStkPush({ phoneNumber, amount, accountName, orderId }, logger);
      return res.json(result);
    } catch (e) {
      logger.error('M-Pesa initiation failed', e.message || e.toString());
      return res.status(500).json({ error: 'Failed to initiate M-Pesa payment' });
    }
  });

  return router;
};
