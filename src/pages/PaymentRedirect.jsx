import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function PaymentRedirect() {
  const { orderId } = useParams();
  const [paymentUrl, setPaymentUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [txRef, setTxRef] = useState('');

  useEffect(() => {
    handlePaymentRedirect();
  }, [orderId]);

  const handlePaymentRedirect = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.post('/payment/initialize', {
        orderId: orderId,
        amount: response.data.totalAmount
      });

      if (response.data.paymentUrl) {
        setPaymentUrl(response.data.paymentUrl);
        setTxRef(response.data.transactionId);
        // Redirect to Flutterwave payment page after short delay
        setTimeout(() => {
          window.location.href = response.data.paymentUrl;
        }, 2000);
      } else {
        setError('Failed to initialize payment');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error redirecting to payment:', error);
      setError('Failed to process payment');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {error ? (
            <>
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                to="/checkout"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Try Again
              </Link>
            </>
          ) : (
            <>
              <div className="text-blue-500 mb-4">
                <svg className="w-16 h-16 mx-auto animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
              <p className="text-gray-600 mb-6">You will be redirected to a secure payment page to complete your transaction.</p>
              <p className="text-sm text-gray-500">Transaction Reference: {txRef}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
