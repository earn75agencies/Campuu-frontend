import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Store, Package, Star, Calendar, User } from 'lucide-react';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';

export default function SellerProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { addToCart } = useCart();
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSellerProfile();
  }, [id]);

  const fetchSellerProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/seller/${id}`);
      setSellerData(response.data);
    } catch (err) {
      console.error('Error fetching seller profile:', err);
      if (err.response?.status === 404) {
        setError('Seller not found');
      } else if (err.response?.status === 400) {
        setError('This user is not a seller');
      } else {
        setError('Failed to load seller profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading seller profile...</p>
        </div>
      </div>
    );
  }

  if (error || !sellerData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/products"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const { seller, stats, products } = sellerData;
  const isOwnProfile = currentUser?.id === seller.id;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/products"
          className="text-blue-600 hover:text-blue-800 mb-8 inline-flex items-center"
        >
          ← Back to Products
        </Link>

        {/* Seller Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white text-5xl font-bold">
                {seller.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            </div>

            {/* Seller Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <User className="w-8 h-8" />
                {seller.name || 'Seller'}
                {isOwnProfile && (
                  <span className="text-sm font-normal px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                    You
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mb-4">Member since {formatDate(stats.memberSince)}</p>

              {/* Rating */}
              {stats.totalReviews > 0 ? (
                <div className="flex items-center gap-3 mb-4">
                  <StarRating rating={stats.averageRating} size="md" readonly />
                  <span className="text-gray-600">
                    {stats.averageRating.toFixed(1)} ({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              ) : (
                <p className="text-gray-500 italic mb-4">No reviews yet</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <p className="text-sm text-gray-600">Total Products</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Package className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.activeProducts}</p>
                  <p className="text-sm text-gray-600">Active Listings</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor((Date.now() - new Date(stats.memberSince)) / (1000 * 60 * 60 * 24))}
                  </p>
                  <p className="text-sm text-gray-600">Days Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Products by {seller.name}
              <span className="text-lg font-normal text-gray-600 ml-2">({products.length})</span>
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Yet</h3>
              <p className="text-gray-600">
                {isOwnProfile
                  ? 'You haven\'t listed any products yet. Start by adding your first product!'
                  : 'This seller hasn\'t listed any products yet.'}
              </p>
              {isOwnProfile && (
                <Link
                  to="/seller/add-product"
                  className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Add Your First Product
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
