import React from 'react';
import StarRating from './StarRating';

export default function ReviewCard({ review, currentUser, onDelete, onEdit }) {
  const isOwner = currentUser?.id === review.user?._id || currentUser?.id === review.user;
  const isAdmin = currentUser?.role === 'admin';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {review.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {review.user?.name || 'Anonymous User'}
            </h4>
            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" readonly />
      </div>

      <p className="text-gray-700 leading-relaxed">{review.comment}</p>

      {(isOwner || isAdmin) && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
          {isOwner && (
            <button
              onClick={() => onEdit(review)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => onDelete(review._id)}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
