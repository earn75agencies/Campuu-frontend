import React from 'react';

export default function StarRating({ rating, size = 'md', interactive = false, onRatingChange, readonly = true }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  const handleClick = (starValue) => {
    if (interactive && !readonly) {
      onRatingChange(starValue);
    }
  };

  const renderStar = (starNumber) => {
    const filled = starNumber <= Math.round(rating);
    const Icon = filled ? '★' : '☆';

    return (
      <span
        key={starNumber}
        className={`${currentSize} ${interactive && !readonly ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${
          filled ? 'text-yellow-400' : 'text-gray-300'
        }`}
        onClick={() => handleClick(starNumber)}
      >
        {Icon}
      </span>
    );
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(renderStar)}
      {!readonly && (
        <span className="ml-2 text-sm text-gray-600">
          {rating}/5
        </span>
      )}
    </div>
  );
}
