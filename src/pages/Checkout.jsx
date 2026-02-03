import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('shippingAddress.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        shippingAddress: {
          ...formData.shippingAddress,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setProcessing(true);
    try {
      const response = await api.post('/orders', {
        items: cartItems.map(item => ({
          productId: item._id || item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.price
        })),
        totalAmount: cartTotal,
        shippingAddress: formData.shippingAddress
      });

      clearCart();
      window.location.href = `/payment/redirect/${response.data._id}`;
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
          <p className="text-gray-600 mb-8">Your cart is empty</p>
          <Link
            to="/products"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                name="shippingAddress.street"
                value={formData.shippingAddress.street}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="shippingAddress.city"
                value={formData.shippingAddress.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="shippingAddress.state"
                value={formData.shippingAddress.state}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              <input
                type="text"
                name="shippingAddress.zipCode"
                value={formData.shippingAddress.zipCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition text-white font-medium"
            >
              {processing ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <div className="flex items-center space-x-4">
                    {item.images && item.images[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium">KES {item.price * item.quantity}</span>
                </div>
              ))}

              <hr />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>KES {cartTotal}</span>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Payment Method</h3>
                <p className="text-blue-700">M-Pesa (Safaricom Daraja)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
