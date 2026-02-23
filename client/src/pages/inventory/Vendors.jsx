import { useEffect, useState } from 'react';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  useEffect(() => {
    fetch('/api/inventory/vendors').then(r => r.json()).then(setVendors);
  }, []);

  function add() {
    fetch('/api/inventory/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contact_info: contact }),
    })
      .then(r => r.json())
      .then(v => setVendors(prev => [...prev, v]));
    setName('');
    setContact('');
  }

  function remove(id) {
    fetch(`/api/inventory/vendors/${id}`, { method: 'DELETE' }).then(() =>
      setVendors(prev => prev.filter(v => v.id !== id))
    );
  }

  function update(id, newName, newContact) {
    fetch(`/api/inventory/vendors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, contact_info: newContact }),
    })
      .then(r => r.json())
      .then(updated =>
        setVendors(prev => prev.map(v => (v.id === id ? updated : v)))
      );
  }

  return (
    <div>
      <h2>Vendors</h2>
      <ul>
        {vendors.map(v => (
          <li key={v.id} className="flex items-center space-x-2">
            <span>
              {v.name} ({v.contact_info})
            </span>
            <button
              onClick={() => remove(v.id)}
              className="text-red-500 text-sm"
            >
              delete
            </button>
            <button
              onClick={() => {
                const n = prompt('name', v.name);
                const c = prompt('contact', v.contact_info || '');
                if (n !== null) update(v.id, n, c);
              }}
              className="text-blue-500 text-sm"
            >
              edit
            </button>
          </li>
        ))}
      </ul>
      <div className="space-x-2">
        <input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border p-1"
        />
        <input
          placeholder="Contact Info"
          value={contact}
          onChange={e => setContact(e.target.value)}
          className="border p-1"
        />
        <button onClick={add} className="px-2 py-1 bg-green-500 text-white">
          Add
        </button>
      </div>
    </div>
  );
}
