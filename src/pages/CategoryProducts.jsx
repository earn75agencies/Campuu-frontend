import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const categoryColors = {
  'Books': 'bg-blue-100 text-blue-800',
  'Electronics': 'bg-purple-100 text-purple-800',
  'Clothing': 'bg-pink-100 text-pink-800',
  'Accessories': 'bg-green-100 text-green-800',
  'Other': 'bg-gray-100 text-gray-800'
};

export default function CategoryProducts() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    fetchProducts();
  }, [categoryName, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products?category=${encodeURIComponent(categoryName)}&sort=${sortBy}&order=desc&limit=50`);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-blue-600 hover:text-blue-800">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link to="/categories" className="text-blue-600 hover:text-blue-800">
                Categories
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{decodeURIComponent(categoryName)}</li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {decodeURIComponent(categoryName)}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[decodeURIComponent(categoryName)] || 'bg-gray-100 text-gray-800'}`}>
                  {products.length} {products.length === 1 ? 'product' : 'products'}
                </span>
              </div>
              <p className="text-gray-600">
                Browse all {decodeURIComponent(categoryName).toLowerCase()} available in our marketplace
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="mt-4 md:mt-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="averageRating-desc">Top Rated</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h2>
            <p className="text-gray-600 mb-6">
              No products available in {decodeURIComponent(categoryName)} category at the moment.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/categories"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Browse Other Categories
              </Link>
              <Link
                to="/products"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                All Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Browse Other Categories */}
        {!loading && products.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse Other Categories</h3>
            <Link
              to="/categories"
              className="text-blue-600 hover:text-blue-800"
            >
              View All Categories →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
