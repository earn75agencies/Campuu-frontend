import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';

export default function ReviewsList({ productId, productRating, reviewCount }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [productId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reviews/product/${productId}?page=${page}&limit=5`);
      setReviews(Array.isArray(response.data.reviews) ? response.data.reviews : []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    fetchReviews();
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/reviews/${reviewId}`);
        fetchReviews();
      } catch (err) {
        console.error('Error deleting review:', err);
        alert('Failed to delete review');
      }
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  const handleWriteReview = () => {
    if (!user) {
      alert('Please login to write a review');
      return;
    }
    setEditingReview(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          {!showForm && (
            <button
              onClick={handleWriteReview}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Write a Review
            </button>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">
              {productRating > 0 ? productRating.toFixed(1) : 'N/A'}
            </div>
            <StarRating rating={productRating} size="md" readonly />
            <p className="text-sm text-gray-500 mt-1">{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</p>
          </div>

          {/* Rating Distribution */}
          {reviewCount > 0 && Array.isArray(reviews) && (
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => r && Math.round(r.rating) === star).length;
                const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600 w-8">{star} ★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="mt-6">
          <ReviewForm
            productId={productId}
            existingReview={editingReview}
            onSuccess={handleReviewSuccess}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : !Array.isArray(reviews) || reviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUser={user}
                onDelete={handleDeleteReview}
                onEdit={handleEditReview}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
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
  );
}
