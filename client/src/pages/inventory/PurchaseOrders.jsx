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

  const loadItems = orderId => {
    fetch(`/api/inventory/purchase-orders/${orderId}/items`)
      .then(r => r.json())
      .then(rows => setItemsMap(prev => ({ ...prev, [orderId]: rows })));
  };

  const updateStatus = (id, newStatus) => {
    fetch(`/api/inventory/purchase-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(r => r.json())
      .then(updated =>
        setOrders(prev => prev.map(o => (o.id === id ? updated : o)))
      );
  };

  return (
    <div>
      <h2>Purchase Orders</h2>
      <ul>
        {orders.map(o => (
          <li key={o.id} className="mb-2">
            PO {o.id} from vendor {o.vendor_id} -
            <select
              value={o.status}
              onChange={e => updateStatus(o.id, e.target.value)}
              className="border ml-2 p-1"
            >
              <option value="pending">pending</option>
              <option value="received">received</option>
            </select>
            <button
              onClick={() => loadItems(o.id)}
              className="ml-2 px-1 py-0.5 bg-blue-400 text-white"
            >
              items
            </button>
            {itemsMap[o.id] && (
              <div className="ml-4 mt-1">
                <ul>
                  {itemsMap[o.id].map(i => (
                    <li key={i.id}>
                      material {i.raw_material_id} x{i.quantity} @ {i.unit_price}
                    </li>
                  ))}
                </ul>
                <AddItemForm orderId={o.id} refresh={() => loadItems(o.id)} />
              </div>
            )}
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
