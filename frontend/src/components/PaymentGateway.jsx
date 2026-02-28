import React, { useState } from 'react';
import '../styles/payment.css';

const PaymentGateway = ({ isOpen, onClose, total, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const [mpesaForm, setMpesaForm] = useState({
    phoneNumber: '',
    accountName: ''
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

  const handleClose = () => {
    setSelectedMethod('mpesa');
    setPaymentConfirmed(false);
    setTransactionId('');
    setMpesaForm({ phoneNumber: '', accountName: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="payment-gateway-overlay" onClick={handleClose}>
      <div className="payment-gateway" onClick={(e) => e.stopPropagation()}>
        <button className="payment-close" onClick={handleClose}>×</button>

        {!paymentConfirmed ? (
          <>
            <h2>M-Pesa Payment</h2>
            <p className="payment-amount">Amount: KES {total.toLocaleString()}</p>

            <div className="payment-form-container">
              <form onSubmit={handleMpesaPayment} className="payment-form">
                <h3>M-Pesa Standard</h3>
                <p className="payment-instruction">
                  Enter your M-Pesa details below. You will receive a prompt on your phone to enter your PIN.
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
            </div>
          </>
        ) : (
          <div className="payment-confirmation">
            <div className="confirmation-icon">✓</div>
            <h2>Payment Successful!</h2>
            <div className="confirmation-details">
              <p className="transaction-id">Transaction ID: {transactionId}</p>
              <p className="payment-amount">Amount: KES {total.toLocaleString()}</p>
              <p className="confirmation-message">
                Your M-Pesa payment has been processed successfully. You will receive an order confirmation email shortly.
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
