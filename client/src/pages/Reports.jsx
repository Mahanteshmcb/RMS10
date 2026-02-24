import { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);


export default function Reports() {
  const [sales, setSales] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [limit, setLimit] = useState(10);
  const [summary, setSummary] = useState({});
  const [active, setActive] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [revenueByPayment, setRevenueByPayment] = useState([]);

  // refs for chart canvas if needed
  const salesChartRef = useRef();
  const categoryChartRef = useRef();
  const paymentChartRef = useRef();
  const topItemsChartRef = useRef();

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
    fetch('/api/reporting/dashboard/revenue-by-category')
      .then(r => r.json())
      .then(setRevenueByCategory)
      .catch(e => console.log('Category revenue fetch error:', e));
    fetch('/api/reporting/dashboard/revenue-by-payment')
      .then(r => r.json())
      .then(setRevenueByPayment)
      .catch(e => console.log('Payment revenue fetch error:', e));
  }, []);

  // export helpers
  const exportData = (data, filename) => {
    if (!data || data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), filename);
  };

  const exportCsv = (data, filename) => {
    if (!data || data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  };

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
        <div className="mb-2 space-x-2">
          <button
            className="px-2 py-1 bg-green-500 text-white"
            onClick={() => exportData(active, 'active-orders.xlsx')}
          >
            Export XLSX
          </button>
          <button
            className="px-2 py-1 bg-green-500 text-white"
            onClick={() => exportCsv(active, 'active-orders.csv')}
          >
            Export CSV
          </button>
        </div>
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
        <h2>Revenue by Category</h2>
        <div className="mb-2 space-x-2">
          <button
            className="px-2 py-1 bg-green-500 text-white"
            onClick={() => exportData(revenueByCategory, 'revenue-by-category.xlsx')}
          >
            Export XLSX
          </button>
          <button
            className="px-2 py-1 bg-green-500 text-white"
            onClick={() => exportCsv(revenueByCategory, 'revenue-by-category.csv')}
          >
            Export CSV
          </button>
        </div>
        <div className="w-full max-w-md mb-4">
          <Pie
            data={{
              labels: revenueByCategory.map(r => r.category_name),
              datasets: [
                {
                  data: revenueByCategory.map(r => r.total_revenue),
                  backgroundColor: [
                    '#4ade80',
                    '#60a5fa',
                    '#facc15',
                    '#f472b6',
                    '#34d399',
                    '#f87171',
                  ],
                },
              ],
            }}
          />
        </div>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2">Category</th>
              <th className="border px-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {revenueByCategory.map(r => (
              <tr key={r.category_id} className="border-t">
                <td className="px-2 py-1">{r.category_name}</td>
                <td className="px-2 py-1">${r.total_revenue || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-6">
        <h2>Revenue by Payment Method</h2>
        <div className="mb-2 space-x-2">
          <button
            className="px-2 py-1 bg-green-500 text-white"
            onClick={() => exportData(revenueByPayment, 'revenue-by-payment.xlsx')}
          >
            Export XLSX
          </button>
          <button
            className="px-2 py-1 bg-green-500 text-white"
            onClick={() => exportCsv(revenueByPayment, 'revenue-by-payment.csv')}
          >
            Export CSV
          </button>
        </div>
        <div className="w-full max-w-md mb-4">
          <Pie
            data={{
              labels: revenueByPayment.map(r => r.payment_method),
              datasets: [
                {
                  data: revenueByPayment.map(r => r.total),
                  backgroundColor: ['#60a5fa', '#f87171', '#34d399', '#facc15'],
                },
              ],
            }}
          />
        </div>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2">Payment Method</th>
              <th className="border px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {revenueByPayment.map(r => (
              <tr key={r.payment_method} className="border-t">
                <td className="px-2 py-1">{r.payment_method}</td>
                <td className="px-2 py-1">${r.total || 0}</td>
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
          <button
            className="px-2 py-1 bg-green-500 text-white"
            onClick={() => exportData(sales, 'sales-by-day.xlsx')}
          >
            Export XLSX
          </button>
          <button
            className="px-2 py-1 bg-green-500 text-white"
            onClick={() => exportCsv(sales, 'sales-by-day.csv')}
          >
            Export CSV
          </button>
        </div>
        <div className="w-full max-w-xl mb-4">
          <Line
            ref={salesChartRef}
            data={{
              labels: sales.map(s => new Date(s.day).toLocaleDateString()),
              datasets: [
                {
                  label: 'Revenue',
                  data: sales.map(s => s.total),
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59,130,246,0.2)',
                },
              ],
            }}
          />
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
          <button
            className="px-2 py-1 bg-green-500 text-white"
            onClick={() => exportData(topItems, 'top-menu-items.xlsx')}
          >
            Export XLSX
          </button>
          <button
            className="px-2 py-1 bg-green-500 text-white"
            onClick={() => exportCsv(topItems, 'top-menu-items.csv')}
          >
            Export CSV
          </button>
        </div>
        <div className="w-full max-w-xl mb-4">
          <Bar
            ref={topItemsChartRef}
            data={{
              labels: topItems.map(i => i.name),
              datasets: [
                {
                  label: 'Sold',
                  data: topItems.map(i => i.sold),
                  backgroundColor: '#f59e0b',
                },
              ],
            }}
          />
        </div>
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
