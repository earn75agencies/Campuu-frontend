import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import SearchFilters from '../components/SearchFilters';

export default function AdvancedSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Parse filters from URL
  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : null,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : null,
    minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')) : null,
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc'
  };

  const [searchTerm, setSearchTerm] = useState(filters.search);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Build query params from filters
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice !== null) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice !== null) params.append('maxPrice', filters.maxPrice);
      if (filters.minRating !== null) params.append('minRating', filters.minRating);
      params.append('sort', filters.sort);
      params.append('order', filters.order);
      params.append('page', searchParams.get('page') || 1);
      params.append('limit', 12);

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products);
      setTotalProducts(response.data.pagination.totalProducts);
      setTotalPages(response.data.pagination.totalPages);
      setCurrentPage(response.data.pagination.currentPage);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ ...filters, search: searchTerm });
  };

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams();

    if (newFilters.search) params.append('search', newFilters.search);
    if (newFilters.category) params.append('category', newFilters.category);
    if (newFilters.minPrice !== null) params.append('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice !== null) params.append('maxPrice', newFilters.maxPrice);
    if (newFilters.minRating !== null) params.append('minRating', newFilters.minRating);
    params.append('sort', newFilters.sort);
    params.append('order', newFilters.order);
    params.append('page', '1'); // Reset to page 1 on filter change

    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSearchParams({ sort: 'createdAt', order: 'desc', page: '1' });
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSortLabel = () => {
    const labels = {
      'createdAt-desc': 'Newest',
      'createdAt-asc': 'Oldest',
      'price-asc': 'Price: Low to High',
      'price-desc': 'Price: High to Low',
      'averageRating-desc': 'Top Rated',
      'reviewCount-desc': 'Most Reviewed',
      'name-asc': 'Name: A-Z',
      'name-desc': 'Name: Z-A'
    };
    return labels[`${filters.sort}-${filters.order}`] || 'Newest';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Products</h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <SearchFilters
              filters={filters}
              onChange={updateFilters}
              onReset={resetFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-700">
                  {loading ? (
                    'Searching...'
                  ) : (
                    <>
                      <span className="font-semibold">{totalProducts}</span> products found
                      {filters.search && ` for "${filters.search}"`}
                    </>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort:</span>
                  <span className="font-medium text-gray-900">{getSortLabel()}</span>
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
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No products found</h2>
                <p className="text-gray-600 mb-6">
                  {filters.search
                    ? `No products match your search "${filters.search}"`
                    : 'No products match your filters'}
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      const showPage =
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                      if (!showPage) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 border rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
