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

  return (
    <div>
      <h2>Vendors</h2>
      <ul>
        {vendors.map(v => (
          <li key={v.id}>
            {v.name} ({v.contact_info})
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
