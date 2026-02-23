import { useEffect, useState } from 'react';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [vendors, setVendors] = useState([]);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    fetch('/api/inventory/purchase-orders').then(r => r.json()).then(setOrders);
    fetch('/api/inventory/vendors').then(r => r.json()).then(setVendors);
  }, []);

  function create() {
    fetch('/api/inventory/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor_id: vendorId, status }),
    })
      .then(r => r.json())
      .then(o => setOrders(prev => [...prev, o]));
    setVendorId('');
    setStatus('pending');
  }

  return (
    <div>
      <h2>Purchase Orders</h2>
      <ul>
        {orders.map(o => (
          <li key={o.id}>
            PO {o.id} from vendor {o.vendor_id} - {o.status}
          </li>
        ))}
      </ul>
      <div className="space-x-2">
        <select
          value={vendorId}
          onChange={e => setVendorId(e.target.value)}
          className="border p-1"
        >
          <option value="">--vendor--</option>
          {vendors.map(v => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="border p-1"
        >
          <option value="pending">pending</option>
          <option value="received">received</option>
        </select>
        <button onClick={create} className="px-2 py-1 bg-green-500 text-white">
          Create
        </button>
      </div>
    </div>
  );
}
