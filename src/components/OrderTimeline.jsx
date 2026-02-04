import React from 'react';

const statusConfig = {
  pending: {
    label: 'Order Placed',
    icon: '📝',
    color: 'bg-gray-500',
    description: 'Your order has been received'
  },
  processing: {
    label: 'Processing',
    icon: '⚙️',
    color: 'bg-blue-500',
    description: 'Your order is being prepared'
  },
  shipped: {
    label: 'Shipped',
    icon: '🚚',
    color: 'bg-purple-500',
    description: 'Your order is on its way'
  },
  delivered: {
    label: 'Delivered',
    icon: '✅',
    color: 'bg-green-500',
    description: 'Your order has been delivered'
  },
  cancelled: {
    label: 'Cancelled',
    icon: '❌',
    color: 'bg-red-500',
    description: 'Your order has been cancelled'
  }
};

const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderTimeline({ statusHistory, currentStatus }) {
  // Get all unique statuses from history in order
  const getStatusIndex = (status) => {
    if (status === 'cancelled') return -1;
    return statusOrder.indexOf(status);
  };

  // Determine which statuses should be shown as completed
  const currentStatusIndex = getStatusIndex(currentStatus);

  const statuses = currentStatus === 'cancelled'
    ? ['pending', 'cancelled']
    : statusOrder.slice(0, currentStatusIndex + 1);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-6">
          {statuses.map((status, index) => {
            const config = statusConfig[status];
            const isLast = index === statuses.length - 1;

            // Find history entry for this status
            const historyEntry = statusHistory.find(h => h.status === status);

            return (
              <div key={status} className="relative flex items-start gap-4">
                {/* Status icon */}
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${config.color} text-white`}>
                  {config.icon}
                </div>

                {/* Status details */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{config.label}</h4>
                    {isLast && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{config.description}</p>
                  {historyEntry?.timestamp && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(historyEntry.timestamp)}
                    </p>
                  )}
                  {historyEntry?.note && (
                    <p className="text-sm text-gray-700 mt-2 italic">
                      Note: {historyEntry.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
