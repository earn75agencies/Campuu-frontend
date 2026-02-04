import React, { useState } from 'react';
import api from '../api/axios';

export default function OrderStatusUpdate({ order, onUpdate }) {
  const [updating, setUpdating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    orderStatus: order.orderStatus || '',
    trackingNumber: order.trackingNumber || '',
    estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : '',
    note: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updateData = {
        orderStatus: formData.orderStatus,
        trackingNumber: formData.trackingNumber || null,
        estimatedDelivery: formData.estimatedDelivery ? new Date(formData.estimatedDelivery) : null,
        note: formData.note
      };

      await api.put(`/orders/${order._id}/status`, updateData);

      alert('Order status updated successfully!');
      setShowForm(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm font-medium"
      >
        Update Status
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
          <select
            value={formData.orderStatus}
            onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {(formData.orderStatus === 'shipped' || formData.orderStatus === 'processing') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number (Optional)</label>
              <input
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter tracking number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery (Optional)</label>
              <input
                type="date"
                value={formData.estimatedDelivery}
                onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note to Customer (Optional)</label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Add a note for the customer"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={updating}
            className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition font-medium"
          >
            {updating ? 'Updating...' : 'Update Status'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
