import { useEffect, useState } from 'react';

export default function WaiterDashboard() {
  const [tables, setTables] = useState([
    { id: 1, name: 'T1', status: 'occupied', guests: 2, order: 'Main Course' },
    { id: 2, name: 'T2', status: 'vacant', guests: 0, order: '' },
    { id: 3, name: 'T3', status: 'occupied', guests: 4, order: 'Appetizers' },
    { id: 4, name: 'T4', status: 'billed', guests: 2, order: 'Waiting for payment' },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Waiter Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage tables and take orders.</p>
      </div>

      {/* Table Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="bg-green-100 border border-green-300 rounded-lg p-3">
          <p className="text-2xl">🪑</p>
          <p className="text-sm text-gray-600">Vacant</p>
          <p className="text-xl font-bold">2</p>
        </div>
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
          <p className="text-2xl">🍽️</p>
          <p className="text-sm text-gray-600">Occupied</p>
          <p className="text-xl font-bold">2</p>
        </div>
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
          <p className="text-2xl">💳</p>
          <p className="text-sm text-gray-600">Billed</p>
          <p className="text-xl font-bold">1</p>
        </div>
        <div className="bg-purple-100 border border-purple-300 rounded-lg p-3">
          <p className="text-2xl">📋</p>
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-xl font-bold">0</p>
        </div>
      </div>

      {/* Tables Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Tables</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tables.map((table) => {
            const bgColor =
              table.status === 'vacant'
                ? 'bg-green-50 border-green-300'
                : table.status === 'occupied'
                ? 'bg-blue-50 border-blue-300'
                : 'bg-yellow-50 border-yellow-300';

            return (
              <div key={table.id} className={`border-2 ${bgColor} rounded-lg p-4 cursor-pointer hover:shadow-lg transition`}>
                <div className="text-center">
                  <p className="text-2xl font-bold">{table.name}</p>
                  <p className="text-xs text-gray-500 capitalize mt-1">{table.status}</p>
                  {table.guests > 0 && (
                    <p className="text-sm text-gray-600 mt-2">👥 {table.guests} guests</p>
                  )}
                  {table.order && (
                    <p className="text-xs text-gray-600 mt-2 truncate">{table.order}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                      Order
                    </button>
                    <button className="flex-1 text-xs bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500">
                      Status
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="space-y-2">
          {[
            { id: '#001', table: 'T1', items: '2x Chicken, 1x Paneer', status: 'Served' },
            { id: '#002', table: 'T3', items: '3x Samosa, 2x Spring Rolls', status: 'Preparing' },
          ].map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-semibold">{order.id} - {order.table}</p>
                <p className="text-sm text-gray-600">{order.items}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${order.status === 'Served' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
