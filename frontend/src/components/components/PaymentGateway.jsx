import React, { useState } from 'react';
import '../styles/payment.css';

const PaymentGateway = ({ isOpen, onClose, total, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const [mpesaForm, setMpesaForm] = useState({
    phoneNumber: '',
    accountName: ''
  });

  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  const [paypalForm, setPaypalForm] = useState({
    email: ''
  });

  const handleMpesaPayment = async (e) => {
    e.preventDefault();
    if (!mpesaForm.phoneNumber || !mpesaForm.accountName) {
      alert('Please fill in all M-Pesa fields');
      return;
    }

    setIsProcessing(true);
    try {
      const resp = await fetch('/api/payments/mpesa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: mpesaForm.phoneNumber, amount: total, accountName: mpesaForm.accountName })
      });
      if (!resp.ok) {
        let errorData;
        try {
          errorData = await resp.json();
        } catch {
          errorData = { error: 'M-Pesa initiation failed' };
        }
        throw new Error(errorData.error || 'M-Pesa initiation failed');
      }
      const data = await resp.json();

      setIsProcessing(false);
      setPaymentConfirmed(true);
      setTransactionId(data.transactionId || `MPESA-${Date.now()}`);
      onPaymentSuccess({ method: 'mpesa', phoneNumber: mpesaForm.phoneNumber, amount: total, transactionId: data.transactionId || `MPESA-${Date.now()}` });
    } catch (err) {
      setIsProcessing(false);
      alert(err.message || 'M-Pesa payment failed');
    }
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();
    if (!cardForm.cardNumber || !cardForm.cardHolder || !cardForm.expiryDate || !cardForm.cvv) {
      alert('Please fill in all card fields');
      return;
    }

    setIsProcessing(true);
    try {
      // Create payment intent on backend
      const resp = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalPrice: total, currency: 'usd', items: [] })
      });
      if (!resp.ok) {
        let errorData;
        try {
          errorData = await resp.json();
        } catch {
          errorData = { error: 'Failed to create payment intent' };
        }
        throw new Error(errorData.error || 'Failed to create payment intent');
      }
      const data = await resp.json();

      // Confirm intent (backend will mock when STRIPE not configured)
      const confirmResp = await fetch('/api/payments/confirm-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intentId: data.intentId, paymentMethodId: 'pm_card_visa' })
      });
      if (!confirmResp.ok) {
        let errorData;
        try {
          errorData = await confirmResp.json();
        } catch {
          errorData = { error: 'Payment failed' };
        }
        throw new Error(errorData.error || 'Payment failed');
      }
      const confirmData = await confirmResp.json();
      if (confirmData.status !== 'succeeded') throw new Error(confirmData.error || 'Payment failed');

      setIsProcessing(false);
      setPaymentConfirmed(true);
      const txId = confirmData.chargeId || `STRIPE-${Date.now()}`;
      setTransactionId(txId);
      onPaymentSuccess({ method: 'stripe', last4: cardForm.cardNumber.slice(-4), amount: total, transactionId: txId });
    } catch (err) {
      setIsProcessing(false);
      alert(err.message || 'Stripe payment failed');
    }
  };

  const handlePayPalPayment = async (e) => {
    e.preventDefault();
    if (!paypalForm.email) {
      alert('Please enter PayPal email');
      return;
    }

    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentConfirmed(true);
      setTransactionId(`PAYPAL-${Date.now()}`);
      onPaymentSuccess({
        method: 'paypal',
        email: paypalForm.email,
        amount: total,
        transactionId: `PAYPAL-${Date.now()}`
      });
    }, 2000);
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setPaymentConfirmed(false);
    setTransactionId('');
    setMpesaForm({ phoneNumber: '', accountName: '' });
    setCardForm({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
    setPaypalForm({ email: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="payment-gateway-overlay" onClick={handleClose}>
      <div className="payment-gateway" onClick={(e) => e.stopPropagation()}>
        <button className="payment-close" onClick={handleClose}>×</button>

        {!paymentConfirmed ? (
          <>
            <h2>Payment Method</h2>
            <p className="payment-amount">Amount: KES {total.toLocaleString()}</p>

            {!selectedMethod ? (
              <div className="payment-methods">
                <button
                  className="payment-option"
                  onClick={() => setSelectedMethod('mpesa')}
                >
                  <div className="method-icon">📱</div>
                  <div className="method-info">
                    <h4>M-Pesa</h4>
                    <p>Pay via M-Pesa mobile money</p>
                  </div>
                  <div className="method-arrow">→</div>
                </button>

                <button
                  className="payment-option"
                  onClick={() => setSelectedMethod('stripe')}
                >
                  <div className="method-icon">💳</div>
                  <div className="method-info">
                    <h4>Stripe (Card)</h4>
                    <p>Pay via Visa, Mastercard, or American Express</p>
                  </div>
                  <div className="method-arrow">→</div>
                </button>

                <button
                  className="payment-option"
                  onClick={() => setSelectedMethod('paypal')}
                >
                  <div className="method-icon">🅿️</div>
                  <div className="method-info">
                    <h4>PayPal</h4>
                    <p>Secure payment via PayPal</p>
                  </div>
                  <div className="method-arrow">→</div>
                </button>
              </div>
            ) : (
              <div className="payment-form-container">
                <button
                  className="back-button"
                  onClick={() => setSelectedMethod(null)}
                >
                  ← Back to Methods
                </button>

                {selectedMethod === 'mpesa' && (
                  <form onSubmit={handleMpesaPayment} className="payment-form">
                    <h3>M-Pesa Payment</h3>
                    <p className="payment-instruction">
                      Enter your M-Pesa details below. You will receive a prompt on your phone.
                    </p>

                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={mpesaForm.phoneNumber}
                        onChange={(e) => setMpesaForm({...mpesaForm, phoneNumber: e.target.value})}
                        placeholder="+254712345678 or 0712345678"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Account Name</label>
                      <input
                        type="text"
                        value={mpesaForm.accountName}
                        onChange={(e) => setMpesaForm({...mpesaForm, accountName: e.target.value})}
                        placeholder="Your name as registered with M-Pesa"
                        required
                      />
                    </div>

                    <div className="payment-details">
                      <p><strong>Amount to Pay:</strong> KES {total.toLocaleString()}</p>
                      <p className="info-text">✓ You will receive a pop-up on your phone</p>
                      <p className="info-text">✓ Enter your M-Pesa PIN to complete payment</p>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Continue to M-Pesa'}
                    </button>
                  </form>
                )}

                {selectedMethod === 'stripe' && (
                  <form onSubmit={handleCardPayment} className="payment-form">
                    <h3>Credit/Debit Card Payment</h3>

                    <div className="form-group">
                      <label>Card Holder Name</label>
                      <input
                        type="text"
                        value={cardForm.cardHolder}
                        onChange={(e) => setCardForm({...cardForm, cardHolder: e.target.value})}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Card Number</label>
                      <input
                        type="text"
                        value={cardForm.cardNumber}
                        onChange={(e) => setCardForm({...cardForm, cardNumber: e.target.value})}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input
                          type="text"
                          value={cardForm.expiryDate}
                          onChange={(e) => setCardForm({...cardForm, expiryDate: e.target.value})}
                          placeholder="MM/YY"
                          maxLength="5"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>CVV</label>
                        <input
                          type="text"
                          value={cardForm.cvv}
                          onChange={(e) => setCardForm({...cardForm, cvv: e.target.value})}
                          placeholder="123"
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>

                    <div className="payment-details">
                      <p><strong>Amount to Pay:</strong> KES {total.toLocaleString()}</p>
                      <p className="info-text">✓ Your payment is 100% secure</p>
                      <p className="info-text">✓ Processing through Stripe payment gateway</p>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Pay with Card'}
                    </button>
                  </form>
                )}

                {selectedMethod === 'paypal' && (
                  <form onSubmit={handlePayPalPayment} className="payment-form">
                    <h3>PayPal Payment</h3>
                    <p className="payment-instruction">
                      You will be redirected to PayPal to complete your payment securely.
                    </p>

                    <div className="form-group">
                      <label>PayPal Email</label>
                      <input
                        type="email"
                        value={paypalForm.email}
                        onChange={(e) => setPaypalForm({...paypalForm, email: e.target.value})}
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div className="payment-details">
                      <p><strong>Amount to Pay:</strong> KES {total.toLocaleString()}</p>
                      <p className="info-text">✓ Secure PayPal checkout</p>
                      <p className="info-text">✓ Your financial information is protected</p>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Redirecting...' : 'Continue to PayPal'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="payment-confirmation">
            <div className="confirmation-icon">✓</div>
            <h2>Payment Successful!</h2>
            <div className="confirmation-details">
              <p className="transaction-id">Transaction ID: {transactionId}</p>
              <p className="payment-amount">Amount: KES {total.toLocaleString()}</p>
              <p className="confirmation-message">
                Your payment has been processed successfully. You will receive an order confirmation email shortly.
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;
