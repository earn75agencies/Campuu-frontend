import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function PaymentFailed() {
  const [error, setError] = useState('');

  useEffect(() => {
    // Check URL params for error message
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-6">{error || 'Something went wrong with your payment. Please try again.'}</p>
          <Link
            to="/checkout"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition inline-block"
          >
            Try Again
          </Link>
          <br />
          <Link
            to="/products"
            className="px-6 py-3 text-blue-600 hover:text-blue-800 transition inline-block mt-2"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
