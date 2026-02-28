import { useEffect, useState } from 'react';
import { useAuth, useRole } from '../../hooks/useAuth';

export default function OwnerDashboard() {
  const { user, restaurantInfo } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    staff: 0,
    lowStock: 0,
  });

  const statCards = [
    { icon: '📋', label: 'Total Orders', value: stats.totalOrders, color: 'bg-blue-500' },
    { icon: '💰', label: 'Revenue', value: `₹${stats.revenue}`, color: 'bg-green-500' },
    { icon: '👥', label: 'Staff Members', value: stats.staff, color: 'bg-purple-500' },
    { icon: '⚠️', label: 'Low Stock', value: stats.lowStock, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome, {user?.username}! Manage your restaurant.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          return (
            <div
              key={idx}
              className="bg-white rounded-lg shadow p-6 border-l-4 hover:shadow-lg transition"
              style={{ borderColor: card.color.replace('bg-', '').replace('-500', '') }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className="text-4xl">{card.icon}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">📋 View All Orders</button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">👥 Manage Staff</button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">📦 Inventory Check</button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">📊 View Reports</button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Restaurant Info</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <p className="font-semibold">{restaurantInfo?.name || 'Loading...'}</p>
            </div>
            <div>
              <span className="text-gray-600">Slug:</span>
              <p className="font-mono text-blue-600">{restaurantInfo?.slug}</p>
            </div>
            <div className="pt-2 border-t">
              <a href={`/r/${restaurantInfo?.slug}`} className="text-blue-600 hover:underline">
                👁️ View Public Menu
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
