import { useState } from 'react';

export default function ChefDashboard() {
  const [orders, setOrders] = useState([
    {
      id: '#001',
      table: 'T1',
      items: [
        { name: 'Grilled Chicken', qty: 2, status: 'preparing' },
        { name: 'Butter Paneer', qty: 1, status: 'pending' },
      ],
      priority: 'high',
      time: '5 min',
    },
    {
      id: '#002',
      table: 'T3',
      items: [
        { name: 'Samosa', qty: 3, status: 'ready' },
        { name: 'Spring Rolls', qty: 2, status: 'ready' },
      ],
      priority: 'normal',
      time: '2 min',
    },
    {
      id: '#003',
      table: 'T5',
      items: [
        { name: 'Fish Curry', qty: 1, status: 'pending' },
      ],
      priority: 'low',
      time: 'Just received',
    },
  ]);

  const updateItemStatus = (orderId, itemName, newStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? {
            ...order,
            items: order.items.map(item =>
              item.name === itemName ? { ...item, status: newStatus } : item
            ),
          }
        : order
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kitchen Display System (KDS)</h1>
        <p className="text-gray-600 mt-2">Manage and track all orders.</p>
      </div>

      {/* Order Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {orders.map((order) => {
          const priorityColor =
            order.priority === 'high'
              ? 'border-red-500 bg-red-50'
              : order.priority === 'normal'
              ? 'border-yellow-500 bg-yellow-50'
              : 'border-green-500 bg-green-50';

          return (
            <div key={order.id} className={`border-2 ${priorityColor} rounded-lg p-4`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-bold">{order.id}</p>
                  <p className="text-sm text-gray-600">Table {order.table}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${order.priority === 'high' ? 'text-red-600' : order.priority === 'normal' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {order.priority.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">{order.time}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="bg-white rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{item.qty}x {item.name}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => updateItemStatus(order.id, item.name, 'pending')}
                            className={`text-xs px-2 py-1 rounded ${item.status === 'pending' ? 'bg-gray-400 text-white' : 'bg-gray-200'}`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => updateItemStatus(order.id, item.name, 'preparing')}
                            className={`text-xs px-2 py-1 rounded ${item.status === 'preparing' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                          >
                            Cooking
                          </button>
                          <button
                            onClick={() => updateItemStatus(order.id, item.name, 'ready')}
                            className={`text-xs px-2 py-1 rounded ${item.status === 'ready' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                          >
                            Ready
                          </button>
                        </div>
                      </div>
                      <div className={`text-2xl ${
                        item.status === 'ready' ? '✅' : item.status === 'preparing' ? '👨‍🍳' : '⏳'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
          <p className="text-2xl">📋</p>
          <p className="text-sm text-gray-600 mt-1">Pending</p>
          <p className="text-2xl font-bold">2</p>
        </div>
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-center">
          <p className="text-2xl">👨‍🍳</p>
          <p className="text-sm text-gray-600 mt-1">Cooking</p>
          <p className="text-2xl font-bold">1</p>
        </div>
        <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
          <p className="text-2xl">✅</p>
          <p className="text-sm text-gray-600 mt-1">Ready</p>
          <p className="text-2xl font-bold">2</p>
        </div>
      </div>
    </div>
  );
}
