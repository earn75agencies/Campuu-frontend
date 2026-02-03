import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminOrders() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders();
  }, [isAdmin]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: status });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Management</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order #{order._id.slice(-8)}</h3>
                  <p className="text-gray-600 text-sm">Customer: {order.userId?.name || 'Unknown'}</p>
                  <p className="text-gray-600 text-sm">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>

              <div className="border-t pt-4 mb-4">
                {order.items.map((item) => (
                  <div key={item._id || item.productId} className="flex justify-between py-2">
                    <span className="text-gray-600">{item.name || 'Product'}</span>
                    <span className="font-medium">KES {item.priceAtPurchase * item.quantity}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-bold text-lg border-t">
                  <span>Total</span>
                  <span>KES {order.totalAmount}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <p className="text-gray-600 text-sm mb-2">Shipping Address:</p>
                <p className="text-gray-900">
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
              </div>

              {order.paymentStatus === 'paid' && (
                <div className="border-t pt-4">
                  <p className="text-green-600 text-sm mb-2">✓ Payment received</p>
                  <p className="text-gray-600 text-sm mb-2">Status: {order.orderStatus}</p>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
