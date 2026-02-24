import { useState } from 'react';

export default function Tables() {
  const [tables, setTables] = useState([]); // placeholder

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tables</h1>
      <p>Add or manage tables and chair counts. Guests can reserve tables via
      the public menu or an in‑restaurant scanner will mark them occupied; waiters
      can also toggle status manually.</p>
      {/* filters could go here */}
      <div className="mt-4">
        <button className="px-3 py-1 bg-blue-500 text-white rounded">
          Add Table
        </button>
      </div>
      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th className="border px-2">ID</th>
            <th className="border px-2">Name</th>
            <th className="border px-2">Seats</th>
            <th className="border px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {tables.map(t => (
            <tr key={t.id} className="border-t">
              <td className="px-2 py-1">{t.id}</td>
              <td className="px-2 py-1">{t.name}</td>
              <td className="px-2 py-1">{t.seats}</td>
              <td className="px-2 py-1">{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
