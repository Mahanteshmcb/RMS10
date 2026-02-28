import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import QRCode from 'react-qr-code';

export default function PublicMenu() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/public/restaurants/${slug}`)
      .then(r => r.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!data) return <p>Not found</p>;

  const { restaurant, categories } = data;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{restaurant.name}</h1>
      {tableId && (
        <div className="mb-4">
          <p>Table ID: {tableId}</p>
        </div>
      )}
      <div className="grid gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">{cat.name}</h2>
            <ul className="space-y-1">
              {(cat.items || []).map(item => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>₹{item.base_price}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <h3 className="font-semibold">Share this restaurant</h3>
        <QRCode value={`${window.location.origin}/r/${restaurant.slug}`} />
        <p className="text-sm">Scan to open menu</p>
      </div>
    </div>
  );
}
