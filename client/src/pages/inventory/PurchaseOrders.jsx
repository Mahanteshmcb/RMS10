import { useEffect, useState } from 'react';

function AddItemForm({ orderId, refresh }) {
  const [matId, setMatId] = useState('');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetch('/api/inventory/materials').then(r => r.json()).then(setMaterials);
  }, []);

  const submit = () => {
    if (!matId) return alert('select material');
    if (qty <= 0) return alert('quantity must be positive');
    fetch(`/api/inventory/purchase-orders/${orderId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_material_id: matId, quantity: qty, unit_price: price }),
    })
      .then(() => {
        setMatId('');
        setQty(1);
        setPrice(0);
        refresh();
      });
  };

  return (
    <div className="mt-2">
      <h4 className="text-sm">Add Item</h4>
      <select value={matId} onChange={e => setMatId(e.target.value)} className="border p-1">
        <option value="">--material--</option>
        {materials.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      <input type="number" value={qty} className="border p-1 w-16 mx-1" onChange={e => setQty(parseFloat(e.target.value))} />
      <input type="number" value={price} className="border p-1 w-20 mx-1" onChange={e => setPrice(parseFloat(e.target.value))} />
      <button onClick={submit} className="px-2 py-1 bg-blue-500 text-white">Add</button>
    </div>
  );
}


export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [vendors, setVendors] = useState([]);
  const [status, setStatus] = useState('pending');
  const [itemsMap, setItemsMap] = useState({});

  const [editing, setEditing] = useState(null);
  const [editVendor, setEditVendor] = useState('');
  const [editStatus, setEditStatus] = useState('pending');

  useEffect(() => {
    fetch('/api/inventory/purchase-orders').then(r => r.json()).then(setOrders);
    fetch('/api/inventory/vendors').then(r => r.json()).then(setVendors);
  }, []);

  function create() {
    if (!vendorId) return alert('select vendor');
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

  const loadItems = orderId => {
    fetch(`/api/inventory/purchase-orders/${orderId}/items`)
      .then(r => r.json())
      .then(rows => setItemsMap(prev => ({ ...prev, [orderId]: rows })));
  };

  const updateOrder = (id, vendor, stat) => {
    fetch(`/api/inventory/purchase-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor_id: vendor, status: stat }),
    })
      .then(r => r.json())
      .then(updated =>
        setOrders(prev => prev.map(o => (o.id === id ? updated : o)))
      );
  };

  return (
    <div>
      <h2>Purchase Orders</h2>
      <table className="w-full mb-4 border">
        <thead>
          <tr>
            <th className="border px-2">ID</th>
            <th className="border px-2">Vendor</th>
            <th className="border px-2">Status</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} className="border-t">
              <td className="px-2 py-1">{o.id}</td>
              <td className="px-2 py-1">
                {editing === o.id ? (
                  <select
                    value={editVendor}
                    onChange={e => setEditVendor(e.target.value)}
                    className="border p-1 w-full"
                  >
                    <option value="">--vendor--</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                ) : (
                  vendors.find(v => v.id === o.vendor_id)?.name || ''
                )}
              </td>
              <td className="px-2 py-1">
                {editing === o.id ? (
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="border p-1"
                  >
                    <option value="pending">pending</option>
                    <option value="received">received</option>
                  </select>
                ) : (
                  o.status
                )}
              </td>
              <td className="px-2 py-1 space-x-1">
                {editing === o.id ? (
                  <>
                    <button
                      onClick={() => {
                        updateOrder(o.id, editVendor, editStatus);
                        setEditing(null);
                      }}
                      className="text-green-600 text-sm"
                    >
                      save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="text-gray-600 text-sm"
                    >
                      cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditing(o.id);
                        setEditVendor(o.vendor_id || '');
                        setEditStatus(o.status);
                      }}
                      className="text-blue-500 text-sm"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => loadItems(o.id)}
                      className="text-blue-500 text-sm"
                    >
                      items
                    </button>
                    <button
                      onClick={() => {
                        fetch(`/api/inventory/purchase-orders/${o.id}`, { method: 'DELETE' })
                          .then(() => setOrders(prev => prev.filter(p => p.id !== o.id)));
                      }}
                      className="text-red-500 text-sm"
                    >
                      delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {Object.entries(itemsMap).map(([orderId, items]) => (
        <div key={orderId} className="mb-4">
          <h4>Items for PO {orderId}</h4>
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border px-2">Material</th>
                <th className="border px-2">Qty</th>
                <th className="border px-2">Price</th>
                <th className="border px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} className="border-t">
                  <td className="px-2 py-1">{i.raw_material_id}</td>
                  <td className="px-2 py-1">{i.quantity}</td>
                  <td className="px-2 py-1">{i.unit_price}</td>
                  <td className="px-2 py-1">
                    <button
                      onClick={() => {
                        fetch(`/api/inventory/purchase-orders/${orderId}/items/${i.id}`, { method: 'DELETE' })
                          .then(() => loadItems(orderId));
                      }}
                      className="text-red-500 text-sm"
                    >
                      delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <AddItemForm orderId={orderId} refresh={() => loadItems(orderId)} />
        </div>
      ))}
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
