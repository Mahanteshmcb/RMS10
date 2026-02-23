import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function Waiter() {
  const [alerts, setAlerts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newItem, setNewItem] = useState({ menu_item_id: '', variant_id: '', quantity: 1, price: 0 });
  const socket = io('http://localhost:3000/waiter');

  useEffect(() => {
    socket.on('item_ready', data => {
      setAlerts(prev => [...prev, data]);
    });
    // fetch open orders
    fetch('/api/pos/orders', { headers: { 'Content-Type': 'application/json' } })
      .then(r => r.json())
      .then(setOrders);
    return () => socket.disconnect();
  }, []);

  function addItem(orderId) {
    fetch(`/api/pos/orders/${orderId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).then(() => alert('added'));
  }

  return (
    <div>
      <h1>Waiter Dashboard</h1>
      <h2>Alerts</h2>
      <ul>
        {alerts.map((a, idx) => (
          <li key={idx}>Item {a.itemId} ready (restaurant {a.restaurantId})</li>
        ))}
      </ul>

      <h2>Open Orders</h2>
      <ul>
        {orders.map(o => (
          <li key={o.id} className="mb-2">
            Order {o.id} - Table {o.table_id} - Status {o.status} - Total {o.total}
          </li>
        ))}
      </ul>

      <h2>Add Item to Order</h2>
      <div className="space-y-2">
        <input
          placeholder="Order ID"
          value={newItem.orderId}
          onChange={e => setNewItem(prev => ({ ...prev, orderId: e.target.value }))}
          className="border p-1"
        />
        <input
          placeholder="Menu Item ID"
          value={newItem.menu_item_id}
          onChange={e => setNewItem(prev => ({ ...prev, menu_item_id: e.target.value }))}
          className="border p-1"
        />
        <input
          placeholder="Variant ID"
          value={newItem.variant_id}
          onChange={e => setNewItem(prev => ({ ...prev, variant_id: e.target.value }))}
          className="border p-1"
        />
        <input
          placeholder="Quantity"
          type="number"
          value={newItem.quantity}
          onChange={e => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
          className="border p-1"
        />
        <input
          placeholder="Price"
          type="number"
          value={newItem.price}
          onChange={e => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
          className="border p-1"
        />
        <button onClick={() => addItem(newItem.orderId)} className="px-2 py-1 bg-blue-500 text-white">
          Add Item
        </button>
      </div>
    </div>
  );
}
