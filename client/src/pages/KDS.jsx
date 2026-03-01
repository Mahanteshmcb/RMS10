import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function KDS() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [now, setNow] = useState(Date.now());
  const [socket, setSocket] = useState(null);

  // Connect to KDS namespace and initialize
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Get restaurantId from localStorage (set during login)
    const restaurantId = localStorage.getItem('restaurantId') || 1; // Ensure this matches your login storage key 

    // 1. Fetch initial orders from the API
    fetch('http://localhost:3000/api/pos/kds/orders', { 
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        // Transform API data to match the KDS card format
        const formattedOrders = data.reduce((acc, curr) => {
          const existing = acc.find(o => o.orderId === curr.order_id);
          const item = { name: curr.item_name, quantity: curr.quantity };
          if (existing) {
            existing.items.push(item);
          } else {
            acc.push({
              orderId: curr.order_id,
              tableName: curr.table_name,
              items: [item],
              startTime: new Date(curr.item_created).getTime(),
              status: 'pending'
            });
          }
          return acc;
        }, []);
        setOrders(formattedOrders);
      })
      .catch(err => console.error("Initial fetch failed:", err));

    // 2. Connect to Socket with restaurantId query
    const newSocket = io('http://localhost:3000/kds', {
      auth: { token },
      query: { restaurantId: String(restaurantId) }, // This fixes the "connected without restaurantId" log
      transports: ['websocket']
    });

    newSocket.on('connect', () => console.log('Connected to KDS Room:', restaurantId));
    
    newSocket.on('new_order', data => {
      console.log('New order received via socket:', data);
      setOrders(prev => [{
        ...data,
        startTime: Date.now(),
        status: 'pending'
      }, ...prev]);
    });

    newSocket.on('disconnect', () => console.log('Disconnected from KDS'));
    setSocket(newSocket);

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      newSocket.disconnect();
      clearInterval(timer);
    };
  }, []);

  // Mark item as ready
  const markReady = (orderId) => {
    fetch(`http://localhost:3000/api/pos/kds/items/${orderId}/ready`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to update');
        return r.json();
      })
      .then(() => {
        setOrders(prev =>
          prev.map(o => o.orderId === orderId ? { ...o, status: 'ready' } : o)
        );
      })
      .catch(err => alert('Error: ' + err.message));
  };

  // Format elapsed time
  const getElapsedTime = (startTime) => {
    const elapsed = Math.floor((now - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredOrders = orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">👨‍🍳 Kitchen Display System</h1>
        <p className="text-gray-400 mb-6">Manage incoming orders and item preparation</p>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['pending', 'ready', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded font-semibold text-lg transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status === 'pending' ? '⏳ Pending' : status === 'ready' ? '✅ Ready' : '🎉 Completed'}
              {' '}({orders.filter(o => o.status === status).length})
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-2xl text-gray-400">
              {filter === 'pending' ? '✨ No pending orders' : filter === 'ready' ? '📭 No ready items' : '🎊 All caught up!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map(order => (
              <div
                key={order.orderId}
                className={`rounded-lg p-4 border-2 transition ${
                  order.status === 'pending'
                    ? 'bg-red-900 border-red-600'
                    : order.status === 'ready'
                    ? 'bg-green-900 border-green-600'
                    : 'bg-gray-800 border-gray-600'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-2xl font-bold">Order #{order.orderId}</h2>
                    {order.tableName && (
                      <p className="text-lg text-gray-300">
                        🪑 Table: {order.tableName}
                      </p>
                    )}
                    {order.customerName && (
                      <p className="text-sm text-gray-400">👤 {order.customerName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      order.status === 'pending'
                        ? 'text-red-200'
                        : order.status === 'ready'
                        ? 'text-green-200'
                        : 'text-gray-300'
                    }`}>
                      {getElapsedTime(order.startTime)}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      order.status === 'pending'
                        ? 'bg-red-600 text-white'
                        : order.status === 'ready'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}>
                      {order.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-black bg-opacity-30 rounded p-3 mb-4">
                  <p className="text-sm text-gray-400 mb-2">Items:</p>
                  <div className="space-y-1">
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <div key={idx} className="text-white text-lg">
                          • {item.quantity}x {item.name || `Item ${item.item_id}`}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">No items detail</p>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div className="text-sm text-gray-300 mb-4 space-y-1">
                  <p>💰 Total: ${order.totalAmount?.toFixed(2) || '0.00'}</p>
                  <p>📦 Type: {order.orderType || 'dine-in'}</p>
                </div>

                {/* Action Button */}
                {order.status === 'pending' && (
                  <button
                    onClick={() => markReady(order.orderId)}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-lg transition"
                  >
                    ✅ Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={() => {
                      fetch(`/api/pos/orders/${order.orderId}/status`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        body: JSON.stringify({ status: 'completed' })
                      })
                        .then(r => {
                          if (!r.ok) throw new Error('Failed to update');
                          setOrders(prev =>
                            prev.map(o => o.orderId === order.orderId ? { ...o, status: 'completed' } : o)
                          );
                        })
                        .catch(err => alert('Error: ' + err.message));
                    }}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg transition"
                  >
                    🎉 Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
