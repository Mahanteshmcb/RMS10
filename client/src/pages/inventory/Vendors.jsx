import { useEffect, useState } from 'react';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');

  useEffect(() => {
    fetch('/api/inventory/vendors').then(r => r.json()).then(setVendors);
  }, []);

  function add() {
    if (!name.trim()) return alert('Name required');
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
      <table className="w-full mb-4 border">
        <thead>
          <tr>
            <th className="border px-2">Name</th>
            <th classity="border px-2">Contact</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map(v => (
            <tr key={v.id} className="border-t">
              <td className="px-2 py-1">
                {editing === v.id ? (
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="border p-1 w-full"
                  />
                ) : (
                  v.name
                )}
              </td>
              <td className="px-2 py-1">
                {editing === v.id ? (
                  <input
                    value={editContact}
                    onChange={e => setEditContact(e.target.value)}
                    className="border p-1 w-full"
                  />
                ) : (
                  v.contact_info
                )}
              </td>
              <td className="px-2 py-1 space-x-1">
                {editing === v.id ? (
                  <>
                    <button
                      onClick={() => {
                        update(v.id, editName, editContact);
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
                        setEditing(v.id);
                        setEditName(v.name);
                        setEditContact(v.contact_info || '');
                      }}
                      className="text-blue-500 text-sm"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => remove(v.id)}
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
