import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

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
            {product.images && product.images[0] && (
              <div className="md:w-1/2">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}
            <div className="md:w-1/2 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
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

              <div className="mb-6">
                <p className="text-gray-500">Category: {product.category}</p>
                <p className="text-gray-500">Seller: {product.sellerId?.name || 'Unknown'}</p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => addToCart(product)}
                  disabled={!product.isAvailable || product.stock <= 0}
                  className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition text-white font-medium"
                >
                  Add to Cart
                </button>
                <button className="flex-1 py-3 px-6 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium">
                  Contact Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function addToCart(product) {
  const { addToCart } = useCart();
  addToCart(product);
}
