import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import api from '../api/axios';

export default function WishlistButton({ productId, size = 'md', showLabel = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkWishlist();
    }
  }, [productId, user]);

  const checkWishlist = async () => {
    try {
      const response = await api.get(`/wishlist/check/${productId}`);
      setIsInWishlist(response.data.isInWishlist);
    } catch (err) {
      console.error('Error checking wishlist:', err);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/remove/${productId}`);
        setIsInWishlist(false);
      } else {
        await api.post(`/wishlist/add/${productId}`);
        setIsInWishlist(true);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      alert('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSize = sizeClasses[size] || sizeClasses.md;

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`${
        isInWishlist
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-500'
      } transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${
        showLabel ? 'flex items-center gap-2' : ''
      }`}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={iconSize}
        fill={isInWishlist ? 'currentColor' : 'none'}
      />
      {showLabel && (
        <span className="text-sm">
          {isInWishlist ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
