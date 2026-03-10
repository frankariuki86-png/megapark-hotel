import React, { useState } from 'react';
import '../styles/payment.css';

// Determine API base URL: prefer VITE_API_URL when provided, otherwise use relative `/api` in production and localhost in dev
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const base = envUrl.replace(/\/$/, '');
    return `${base}/api`;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api';
  }
  return 'http://localhost:3000/api';
};
const API_BASE_URL = getApiBaseUrl();
console.log('[PaymentGateway] API_BASE_URL:', API_BASE_URL);

const PaymentGateway = ({ isOpen, onClose, total, onPaymentSuccess, inline = false, isDisabled = false }) => {
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
      const resp = await fetch(`${API_BASE_URL}/payments/mpesa/initiate`, {
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

  const wrapperClass = inline ? 'payment-gateway-inline' : 'payment-gateway-overlay';
  const handleWrapperClick = inline ? undefined : handleClose;

  return (
    <div className={wrapperClass} onClick={handleWrapperClick}>
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
                  disabled={isProcessing || isDisabled}
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
