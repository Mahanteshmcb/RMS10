import { useEffect, useState } from 'react';

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [limit, setLimit] = useState(10);
  const [summary, setSummary] = useState({});
  const [active, setActive] = useState([]);

  const fetchSales = () => {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    fetch(`/api/reporting/sales?${params.toString()}`)
      .then(r => r.json())
      .then(setSales);
  };

  const fetchTop = () => {
    fetch(`/api/reporting/top-items?limit=${limit}`)
      .then(r => r.json())
      .then(setTopItems);
  };

  useEffect(() => {
    fetchSales();
    fetchTop();
    fetch('/api/reporting/dashboard/summary')
      .then(r => r.json())
      .then(setSummary);
    fetch('/api/reporting/dashboard/active-orders')
      .then(r => r.json())
      .then(setActive);
  }, []);

  return (
    <div>
      <h1>Reports & Dashboard</h1>
      <section className="mb-6">
        <h2>Today's Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="border p-4 bg-blue-50">
            <p className="text-sm text-gray-600">Orders Completed</p>
            <p className="text-2xl font-bold">{summary.orders_today || 0}</p>
          </div>
          <div className="border p-4 bg-green-50">
            <p className="text-sm text-gray-600">Revenue</p>
            <p className="text-2xl font-bold">${summary.revenue_today || 0}</p>
          </div>
          <div className="border p-4 bg-purple-50">
            <p className="text-sm text-gray-600">Total Tables</p>
            <p className="text-2xl font-bold">{summary.total_tables || 0}</p>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2>Active Orders</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2">Order ID</th>
              <th className="border px-2">Table</th>
              <th className="border px-2">Status</th>
              <th className="border px-2">Items</th>
              <th className="border px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {active.map(a => (
              <tr key={a.id} className="border-t">
                <td className="px-2 py-1">{a.id}</td>
                <td className="px-2 py-1">{a.table_id}</td>
                <td className="px-2 py-1">{a.status}</td>
                <td className="px-2 py-1">{a.item_count}</td>
                <td className="px-2 py-1">${a.total || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-6">
        <h2>Sales by Day</h2>
        <div className="space-x-2 mb-2">
          <input type="date" value={start} onChange={e => setStart(e.target.value)} />
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
          <button onClick={fetchSales} className="px-2 py-1 bg-blue-500 text-white">
            Refresh
          </button>
        </div>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2">Day</th>
              <th className="border px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(s => (
              <tr key={s.day} className="border-t">
                <td className="px-2 py-1">{new Date(s.day).toLocaleDateString()}</td>
                <td className="px-2 py-1">{s.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Top Menu Items</h2>
        <div className="space-x-2 mb-2">
          <input
            type="number"
            value={limit}
            onChange={e => setLimit(e.target.value)}
            className="w-16 border p-1"
          />
          <button onClick={fetchTop} className="px-2 py-1 bg-blue-500 text-white">
            Refresh
          </button>
        </div>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2">Item</th>
              <th className="border px-2">Sold</th>
            </tr>
          </thead>
          <tbody>
            {topItems.map(i => (
              <tr key={i.name} className="border-t">
                <td className="px-2 py-1">{i.name}</td>
                <td className="px-2 py-1">{i.sold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
