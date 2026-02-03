import React from 'react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      {product.images && product.images[0] && (
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        </div>
        <p className="text-gray-600 mt-2 text-sm">{product.description}</p>
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            KES {product.price}
          </span>
          <span className="text-sm text-gray-500">in stock</span>
        </div>
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
