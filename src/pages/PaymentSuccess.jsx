import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function PaymentSuccess() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  useEffect(() => {
    fetchOrder();
    const status = searchParams.get('status');
    const txRef = searchParams.get('tx_ref');
    
    if (status === 'successful') {
      setPaymentStatus('successful');
      verifyPayment(txRef);
    } else if (status === 'cancelled') {
      setPaymentStatus('cancelled');
    }
  }, [searchParams]);

  const verifyPayment = async (txRef) => {
    try {
      if (txRef) {
        const response = await api.get(`/payment/verify/${txRef}`);
        if (response.data.status === 'successful') {
          setPaymentStatus('successful');
        }
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      const recentOrder = response.data[response.data.length - 1];
      if (recentOrder && recentOrder.paymentStatus === 'paid') {
        setOrder(recentOrder);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            {paymentStatus === 'successful' ? (
              <>
                <div className="text-green-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-600">Thank you for your purchase</p>
              </>
            ) : paymentStatus === 'cancelled' ? (
              <>
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
                <p className="text-gray-600">You have cancelled the payment</p>
              </>
            ) : (
              <>
                <div className="text-yellow-500 mb-4">
                  <svg className="w-16 h-16 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Processing Payment</h1>
                <p className="text-gray-600">Please wait while we verify your payment</p>
              </>
            )}
          </div>

          {paymentStatus === 'successful' && order && (
            <div className="space-y-4 mb-8">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{order._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-medium text-green-600">Paid</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Status:</span>
                <span className="font-medium">{order.orderStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold">KES {order.totalAmount}</span>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">What's Next?</h3>
            <p className="text-gray-600 text-sm">
              {paymentStatus === 'successful' 
                ? 'Your order has been confirmed. The seller will contact you shortly to arrange the delivery.' 
                : 'Please complete your payment to finalize your order.'}
            </p>
          </div>

          <div className="flex space-x-4">
            <Link
              to="/orders"
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-center"
            >
              View My Orders
            </Link>
            <Link
              to="/products"
              className="flex-1 py-3 px-4 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
