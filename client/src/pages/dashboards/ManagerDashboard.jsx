import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  const quickStats = [
    { label: 'Today\'s Orders', value: '24', icon: '📋' },
    { label: 'Active Tables', value: '8', icon: '🪑' },
    { label: 'Pending Deliveries', value: '3', icon: '🚗' },
    { label: 'Staff On Duty', value: '12', icon: '👥' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor operations and manage staff.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, idx) => (
          <div key={idx} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <p className="text-3xl">{stat.icon}</p>
            <p className="text-gray-600 text-sm mt-2">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Schedule */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Staff Schedule</h2>
          <div className="space-y-3">
            {['Waiter 1', 'Waiter 2', 'Chef 1', 'Delivery Boy'].map((staff, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>{staff}</span>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">On Duty</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Alerts</h2>
          <div className="space-y-2">
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm font-semibold text-red-800">Low Stock Alert</p>
              <p className="text-xs text-red-600">Chicken running low</p>
            </div>
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <p className="text-sm font-semibold text-yellow-800">Order Delay</p>
              <p className="text-xs text-yellow-600">Table 5 waiting 15+ min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
