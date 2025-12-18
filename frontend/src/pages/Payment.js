import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../services/api';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPaymentId = `PAY_${Date.now()}`;
      await bookingsAPI.confirm(bookingId, { paymentId: mockPaymentId });
      
      alert('Payment successful! Your booking is confirmed.');
      navigate('/my-bookings');
    } catch (error) {
      alert(error.response?.data?.message || 'Payment failed');
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      await bookingsAPI.cancel(bookingId);
      alert('Booking cancelled successfully');
      navigate('/shows');
    } catch (error) {
      alert(error.response?.data?.message || 'Cancellation failed');
    }
  };

  const containerStyle = {
    padding: '2rem',
    maxWidth: '500px',
    margin: '0 auto'
  };

  const cardStyle = {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  };

  const buttonStyle = {
    padding: '0.75rem 2rem',
    margin: '0.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  };

  const payButtonStyle = {
    ...buttonStyle,
    background: '#4caf50',
    color: 'white'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    background: '#f44336',
    color: 'white'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2>Payment Gateway</h2>
        <div style={{margin: '2rem 0'}}>
          <div style={{fontSize: '3rem', margin: '1rem 0'}}>💳</div>
          <p>This is a mock payment gateway.</p>
          <p>Click "Pay Now" to simulate successful payment.</p>
        </div>

        <div style={{margin: '2rem 0'}}>
          <button 
            onClick={handlePayment}
            disabled={processing}
            style={{...payButtonStyle, opacity: processing ? 0.7 : 1}}
          >
            {processing ? 'Processing Payment...' : 'Pay Now (Mock)'}
          </button>
          <br />
          <button 
            onClick={handleCancel}
            disabled={processing}
            style={cancelButtonStyle}
          >
            Cancel Booking
          </button>
        </div>

        <p style={{fontSize: '0.9rem', color: '#666', marginTop: '1rem'}}>
          In a real application, this would integrate with actual payment gateways like Razorpay, Stripe, etc.
        </p>
      </div>
    </div>
  );
};

export default Payment;