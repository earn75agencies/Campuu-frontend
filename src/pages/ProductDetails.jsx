import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import StarRating from '../components/StarRating';
import ReviewsList from '../components/ReviewsList';
import WishlistButton from '../components/WishlistButton';
import ProductGallery from '../components/ProductGallery';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  const handleContactSeller = async () => {
    if (!product) return;

    try {
      const response = await api.post('/messages/start', {
        productId: product._id,
        recipientId: product.sellerId?._id || product.sellerId,
        initialMessage: `Hi, I'm interested in your product: ${product.name}`
      });

      // Navigate to the conversation
      navigate(`/messages/${response.data.conversation._id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Failed to start conversation');
      }
    }
  };

  if (loading) return <div className="text-center py-12">Loading product...</div>;
  if (!product) return <div className="text-center py-12 text-red-500">Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/products"
          className="text-blue-600 hover:text-blue-800 mb-8 inline-block"
        >
          ← Back to Products
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {product.images && product.images.length > 0 && (
              <div className="md:w-1/2 p-4">
                <ProductGallery images={product.images} />
              </div>
            )}
            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <WishlistButton productId={product._id} size="lg" />
              </div>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-blue-600">
                  KES {product.price}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    product.stock > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>

              {/* Rating Display */}
              {(product.averageRating > 0 || product.reviewCount > 0) && (
                <div className="mb-6 flex items-center gap-3">
                  <StarRating rating={product.averageRating || 0} size="md" readonly />
                  <span className="text-gray-600">
                    {product.averageRating > 0 ? product.averageRating.toFixed(1) : 'No ratings'} ({product.reviewCount || 0} {product.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-gray-500">Category: {product.category}</p>
                {product.sellerId ? (
                  <Link
                    to={`/seller/${product.sellerId._id || product.sellerId}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Seller: {product.sellerId.name || 'Unknown'}
                  </Link>
                ) : (
                  <p className="text-gray-500">Seller: Unknown</p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.isAvailable || product.stock <= 0}
                  className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition text-white font-medium"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleContactSeller}
                  className="flex-1 py-3 px-6 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                >
                  Contact Seller
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <ReviewsList
            productId={product._id}
            productRating={product.averageRating || 0}
            reviewCount={product.reviewCount || 0}
          />
        </div>
      </div>
    </div>
  );
}
