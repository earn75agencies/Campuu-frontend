import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Fetch orders
      const ordersResponse = await api.get('/orders/my-orders');
      setOrders(ordersResponse.data);

      // Fetch seller balance if seller
      if (user?.role === 'seller') {
        const balanceResponse = await api.get('/balance');
        setBalance(balanceResponse.data);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                user?.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user?.role || 'Student'}
              </span>
            </div>
          </div>
        </div>

        {user?.role === 'seller' && balance && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Seller Dashboard</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">KES {balance.totalEarnings?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{balance.totalOrders || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Current Balance</p>
                <p className="text-2xl font-bold text-purple-600">KES {balance.currentBalance?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h3>
          <div className="space-y-4">
            <Link
              to="/orders"
              className="block px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-blue-600 font-medium"
            >
              View My Orders
            </Link>
            {user?.role === 'seller' && (
              <Link
                to="/seller/dashboard"
                className="block px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-blue-600 font-medium"
              >
                Seller Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="block px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-blue-600 font-medium"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
