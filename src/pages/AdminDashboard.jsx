import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    fetchDashboardData();
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch users
      const usersResponse = await api.get('/users');
      setUsers(usersResponse.data);

      // Fetch products
      const productsResponse = await api.get('/products');
      const productsData = productsResponse.data.products || productsResponse.data;
      setProducts(productsData);

      // Fetch orders
      const ordersResponse = await api.get('/orders');
      setOrders(ordersResponse.data);

      // Calculate stats
      const totalUsers = usersResponse.data.length;
      const totalProducts = productsData.length;
      const totalOrders = ordersResponse.data.length;
      const totalRevenue = ordersResponse.data
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + order.totalAmount, 0);

      setStats({ totalUsers, totalProducts, totalOrders, totalRevenue });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 text-sm">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 text-sm">Total Products</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 text-sm">Total Orders</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 text-sm">Total Revenue</h3>
            <p className="text-3xl font-bold text-orange-600">KES {stats.totalRevenue?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Admin Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
            <Link
              to="/admin/users"
              className="block px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-blue-600 font-medium"
            >
              View All Users
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Management</h2>
            <Link
              to="/admin/products"
              className="block px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-purple-600 font-medium"
            >
              View All Products
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Management</h2>
            <Link
              to="/admin/orders"
              className="block px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition text-green-600 font-medium"
            >
              View All Orders
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Seller Management</h2>
            <Link
              to="/admin/sellers"
              className="block px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-lg transition text-orange-600 font-medium"
            >
              View Sellers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
