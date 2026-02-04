import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function Wishlist() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wishlist');
      setWishlist(response.data);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/remove/${productId}`);
      await fetchWishlist();
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const clearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await api.delete('/wishlist/clear');
        await fetchWishlist();
      } catch (err) {
        console.error('Error clearing wishlist:', err);
        alert('Failed to clear wishlist');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              My Wishlist
            </h1>
            <p className="text-gray-600 mt-2">
              {wishlist?.products?.length || 0} {wishlist?.products?.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          {wishlist?.products?.length > 0 && (
            <button
              onClick={clearWishlist}
              className="px-4 py-2 text-red-600 hover:text-red-800 border border-red-600 rounded-lg hover:bg-red-50 transition font-medium"
            >
              Clear All
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {(!wishlist?.products || wishlist.products.length === 0) ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Save items you love by clicking the heart icon on any product
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <Link to={`/products/${product._id}`}>
                  {product.images && product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                </Link>

                <div className="p-4">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-gray-600 mt-2 text-sm line-clamp-2">{product.description}</p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      KES {product.price}
                    </span>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="text-red-500 hover:text-red-700 transition p-2"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {product.averageRating > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600">
                        {product.averageRating.toFixed(1)} ({product.reviewCount})
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.isAvailable || product.stock <= 0}
                    className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition text-white font-medium flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
