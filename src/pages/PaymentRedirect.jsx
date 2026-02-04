import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function PaymentRedirect() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [mpesaStatus, setMpesaStatus] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
      if (user?.phone) {
        setPhoneNumber(user.phone);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleMpesaPayment = async (e) => {
    e.preventDefault();

    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }

    // Validate phone number format
    const formattedPhone = phoneNumber.replace(/\s/g, '');
    if (!/^254\d{9}$/.test(formattedPhone)) {
      setError('Invalid phone number format. Use format 254XXXXXXXXX');
      return;
    }

    try {
      setProcessing(true);
      setError('');

      const response = await api.post('/payment/mpesa/initiate', {
        orderId: orderId,
        amount: order.totalAmount,
        phoneNumber: formattedPhone
      });

      if (response.data.checkoutRequestID) {
        setMpesaStatus('initiated');
        // Poll for payment status
        pollPaymentStatus(response.data.checkoutRequestID);
      } else {
        setError('Failed to initiate M-Pesa payment');
        setProcessing(false);
      }
    } catch (error) {
      console.error('M-Pesa error:', error);
      setError(error.response?.data?.error || 'Failed to initiate M-Pesa payment');
      setProcessing(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestID) => {
    const maxAttempts = 20; // Check for up to 2 minutes (20 * 6 seconds)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await api.get(`/payment/mpesa/status/${checkoutRequestID}`);
        const status = response.data.status;

        if (status === 'completed') {
          setMpesaStatus('completed');
          setTimeout(() => {
            navigate('/payment/success', {
              state: {
                orderId,
                amount: order.totalAmount,
                paymentMethod: 'M-Pesa',
                receiptNumber: response.data.mpesaReceiptNumber
              }
            });
          }, 2000);
          return;
        }

        if (status === 'failed') {
          setMpesaStatus('failed');
          setError(response.data.failureReason || 'Payment failed or cancelled');
          setProcessing(false);
          return;
        }

        // Still pending, continue polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 6000); // Check every 6 seconds
        } else {
          setMpesaStatus('timeout');
          setProcessing(false);
          setError('Payment timed out. Please check your M-Pesa messages.');
        }
      } catch (error) {
        console.error('Status check error:', error);
        // Continue polling on error
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 6000);
        } else {
          setMpesaStatus('timeout');
          setProcessing(false);
          setError('Payment timed out. Please check if money was deducted from your account.');
        }
      }
    };

    checkStatus();
  };

  const handleFlutterwavePayment = async () => {
    try {
      setProcessing(true);
      setError('');

      const response = await api.post('/payment/initialize', {
        orderId: orderId,
        amount: order.totalAmount
      });

      if (response.data.paymentUrl) {
        // Redirect to Flutterwave payment page
        window.location.href = response.data.paymentUrl;
      } else {
        setError('Failed to initialize payment');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Flutterwave error:', error);
      setError(error.response?.data?.error || 'Failed to initialize payment');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/cart')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Payment</h1>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="flex justify-between text-lg font-bold">
              <span>Order ID:</span>
              <span className="text-blue-600">{orderId.slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-2">
              <span>Total Amount:</span>
              <span>KES {order.totalAmount}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* M-Pesa Option */}
              <button
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  paymentMethod === 'mpesa'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.5 12a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                    <span className="font-semibold text-gray-900">M-Pesa</span>
                  </div>
                  {paymentMethod === 'mpesa' && (
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-600 text-left">Pay with M-Pesa (Safaricom)</p>
              </button>

              {/* Card Option */}
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                    <span className="font-semibold text-gray-900">Card / Bank</span>
                  </div>
                  {paymentMethod === 'card' && (
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-600 text-left">Pay with Card, Bank Transfer, or USSD</p>
              </button>
            </div>
          </div>

          {/* M-Pesa Payment Form */}
          {paymentMethod === 'mpesa' && (
            <form onSubmit={handleMpesaPayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254XXXXXXXXX"
                  required
                  disabled={processing || mpesaStatus === 'initiated'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: 254 followed by 9 digits (e.g., 254712345678)
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {mpesaStatus === 'initiated' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-3"></div>
                    <h3 className="font-semibold text-green-900">STK Push Sent!</h3>
                  </div>
                  <p className="text-green-700 text-sm">
                    Please check your phone and enter your M-Pesa PIN to complete the payment.
                  </p>
                  <p className="text-green-600 text-xs mt-2">Waiting for payment confirmation...</p>
                </div>
              )}

              {mpesaStatus === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Payment Successful!</h3>
                  <p className="text-green-700 text-sm">Redirecting to confirmation page...</p>
                </div>
              )}

              <button
                type="submit"
                disabled={processing || mpesaStatus === 'initiated'}
                className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition text-white font-medium flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                    </svg>
                    Pay KES {order.totalAmount} with M-Pesa
                  </>
                )}
              </button>
            </form>
          )}

          {/* Card Payment Button */}
          {paymentMethod === 'card' && (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleFlutterwavePayment}
                disabled={processing}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition text-white font-medium flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                    Pay KES {order.totalAmount} with Card
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 text-center">
                You will be redirected to a secure payment page to complete your transaction.
              </p>
            </div>
          )}

          {/* Security Note */}
          <div className="mt-6 border-t pt-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <div className="text-sm text-gray-500">
                <p>Your payment information is secure. We use M-Pesa Daraja API and Flutterwave
                for secure payment processing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
