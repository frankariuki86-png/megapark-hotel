const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { PaymentIntentSchema } = require('../validators/schemas');
const paymentService = require('../services/paymentService');
const { sendEmail } = require('../services/emailService');
const mpesaService = require('../services/mpesaService');

module.exports = ({ logger }) => {
  // Create payment intent for order
  router.post('/create-intent', async (req, res) => {
    try {
      const payload = PaymentIntentSchema.parse(req.body);
      
      const intent = await paymentService.createPaymentIntent(payload, logger);
      
      return res.json({
        clientSecret: intent.clientSecret,
        intentId: intent.id,
        amount: intent.amount,
        currency: intent.currency
      });
    } catch (e) {
      if (e.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: e.errors });
      }
      logger.error('Payment intent creation failed', e.message);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  });

  // Confirm payment intent (after Stripe Elements token)
  router.post('/confirm-intent', async (req, res) => {
    try {
      const { intentId, paymentMethodId } = req.body;
      
      if (!intentId || !paymentMethodId) {
        return res.status(400).json({ error: 'intentId and paymentMethodId required' });
      }

      const intent = await paymentService.confirmPaymentIntent(intentId, paymentMethodId, logger);
      
      if (intent.status === 'succeeded') {
        return res.json({
          status: 'succeeded',
          chargeId: intent.charges.data[0]?.id
        });
      } else if (intent.status === 'requires_action') {
        return res.json({
          status: 'requires_action',
          clientSecret: intent.client_secret
        });
      } else {
        return res.status(400).json({
          error: 'Payment failed',
          status: intent.status
        });
      }
    } catch (e) {
      logger.error('Payment confirmation failed', e.message);
      res.status(500).json({ error: 'Payment confirmation failed' });
    }
  });

  // Retrieve payment intent status
  router.get('/intent/:intentId', async (req, res) => {
    try {
      const intent = await paymentService.getPaymentIntent(req.params.intentId, logger);
      
      return res.json({
        status: intent.status,
        amount: intent.amount,
        currency: intent.currency,
        chargeId: intent.charges?.data[0]?.id
      });
    } catch (e) {
      logger.error('Failed to retrieve intent', e.message);
      res.status(404).json({ error: 'Intent not found' });
    }
  });

  // Handle Stripe webhook
  router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'];
      const event = paymentService.verifyWebhookSignature(req.body, signature);
      
      // Handle event
      const result = await paymentService.handleWebhookEvent(event, logger);
      
      // Optionally send confirmation email for payment_intent.succeeded
      if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object;
        if (intent.receipt_email && intent.metadata?.orderId) {
          await sendEmail(
            intent.receipt_email,
            'orderConfirmation',
            { id: intent.metadata.orderId, customerName: intent.metadata.customerName, totalPrice: intent.amount / 100 },
            logger
          );
        }
      }
      
      res.json({ received: true, handled: result.handled });
    } catch (e) {
      logger.error('Webhook error', e.message);
      res.status(400).json({ error: 'Webhook error' });
    }
  });

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
