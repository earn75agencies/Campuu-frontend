import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Book, Laptop, Shirt, Briefcase, Layers } from 'lucide-react';

const categoryIcons = {
  'Books': Book,
  'Electronics': Laptop,
  'Clothing': Shirt,
  'Accessories': Briefcase,
  'Other': Layers
};

const categoryColors = {
  'Books': 'bg-blue-100 text-blue-800',
  'Electronics': 'bg-purple-100 text-purple-800',
  'Clothing': 'bg-pink-100 text-pink-800',
  'Accessories': 'bg-green-100 text-green-800',
  'Other': 'bg-gray-100 text-gray-800'
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/categories/list');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse by Category</h1>
          <p className="text-gray-600 text-lg">
            Explore our wide range of products organized by category
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h2>
            <p className="text-gray-600">Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {categories.map((category) => {
              const Icon = categoryIcons[category.name] || Layers;
              const colorClass = categoryColors[category.name] || 'bg-gray-100 text-gray-800';

              return (
                <Link
                  key={category.name}
                  to={`/category/${encodeURIComponent(category.name)}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category.count} {category.count === 1 ? 'product' : 'products'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Popular Categories Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.name}
                  to={`/category/${encodeURIComponent(category.name)}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
