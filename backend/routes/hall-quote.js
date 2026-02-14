const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { sendEmail } = require('../services/emailService');

const QuoteSchema = z.object({
  hallId: z.string().optional(),
  hallName: z.string().optional(),
  packageId: z.string().optional(),
  packageName: z.string().optional(),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  guestCount: z.number().int().min(1).optional(),
  contactName: z.string().min(1),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(5),
  notes: z.string().optional()
});

module.exports = ({ logger }) => {
  // POST /api/halls/quote - submit a hall quote request (public)
  router.post('/', async (req, res) => {
    try {
      const payload = QuoteSchema.parse(req.body);

      // Send to admin
      const adminTo = process.env.SALES_EMAIL || process.env.EMAIL_FROM || process.env.ADMIN_EMAIL || 'sales@megapark-hotel.com';
      const adminResult = await sendEmail(adminTo, 'hallQuoteRequest', payload, logger);

      // Send acknowledgement to user if email provided
      if (payload.contactEmail) {
        await sendEmail(payload.contactEmail, 'adminAlert', { subject: 'Hall Quote Received', message: 'Thank you, we received your request and will reply soon.' }, logger).catch(() => {});
      }

      return res.status(200).json({ sent: true, adminResult });
    } catch (e) {
      if (e.name === 'ZodError') return res.status(400).json({ error: 'validation', details: e.errors });
      logger.error('POST /api/halls/quote error', e.message);
      return res.status(500).json({ error: 'server_error' });
    }
  });

  return router;
};
