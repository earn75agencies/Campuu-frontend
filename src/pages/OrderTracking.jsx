import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import OrderTimeline from '../components/OrderTimeline';

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTracking();
  }, [id]);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}/tracking`);
      setTracking(response.data);
    } catch (err) {
      console.error('Error fetching tracking:', err);
      if (err.response?.status === 404) {
        setError('Order not found');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this order');
      } else {
        setError('Failed to load tracking information');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Tracking</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/orders"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
          <p className="text-gray-600">Order ID: {tracking.orderId}</p>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Current Status</h2>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tracking.orderStatus)}`}>
                {tracking.orderStatus.charAt(0).toUpperCase() + tracking.orderStatus.slice(1)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Payment Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                tracking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                tracking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {tracking.paymentStatus.charAt(0).toUpperCase() + tracking.paymentStatus.slice(1)}
              </span>
            </div>
          </div>

          {/* Tracking Number */}
          {tracking.trackingNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-1">Tracking Number</p>
              <p className="text-lg font-semibold text-blue-900">{tracking.trackingNumber}</p>
            </div>
          )}

          {/* Estimated Delivery */}
          {tracking.estimatedDelivery && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 mb-1">Estimated Delivery</p>
              <p className="text-lg font-semibold text-green-900">{formatDate(tracking.estimatedDelivery)}</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <OrderTimeline
          statusHistory={tracking.statusHistory}
          currentStatus={tracking.orderStatus}
        />

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>

          {/* Items */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
            <div className="space-y-2">
              {tracking.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  {item.productId?.images?.[0] && (
                    <img
                      src={item.productId.images[0]}
                      alt={item.productId.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productId?.name || 'Product'}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity} × KES {item.priceAtPurchase}</p>
                  </div>
                  <p className="font-semibold text-gray-900">KES {item.quantity * item.priceAtPurchase}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h4>
            <p className="text-gray-900">
              {tracking.shippingAddress.street}<br />
              {tracking.shippingAddress.city}, {tracking.shippingAddress.state}<br />
              {tracking.shippingAddress.zipCode}
            </p>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-blue-600">KES {tracking.totalAmount}</span>
            </div>
          </div>

          {/* Order Dates */}
          <div className="mt-4 pt-4 border-t text-sm text-gray-600">
            <p>Order placed: {formatDate(tracking.createdAt)}</p>
            {tracking.updatedAt !== tracking.createdAt && (
              <p>Last updated: {formatDate(tracking.updatedAt)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
