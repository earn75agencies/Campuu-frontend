import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import StarRating from './StarRating';
import WishlistButton from './WishlistButton';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
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
        <div className="flex justify-between items-start mb-2">
          <Link to={`/products/${product._id}`} className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">{product.name}</h3>
          </Link>
          <WishlistButton productId={product._id} size="md" />
        </div>
        <p className="text-gray-600 mt-2 text-sm">{product.description}</p>
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            KES {product.price}
          </span>
          <span className="text-sm text-gray-500">in stock</span>
        </div>

        {/* Rating Display */}
        {(product.averageRating > 0 || product.reviewCount > 0) && (
          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={product.averageRating || 0} size="sm" readonly />
            <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Seller Info */}
        {product.sellerId && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <Link
              to={`/seller/${product.sellerId._id || product.sellerId}`}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              By {product.sellerId.name || 'Seller'}
            </Link>
          </div>
        )}

        <button
          onClick={() => addToCart(product)}
          disabled={!product.isAvailable || product.stock <= 0}
          className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition text-white font-medium"
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
