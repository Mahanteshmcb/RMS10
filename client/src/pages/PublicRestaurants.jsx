import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function PublicRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/public/restaurants')
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const ct = r.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          const text = await r.text();
          throw new Error('expected JSON, got: ' + text.slice(0, 200));
        }
        return r.json();
      })
      .then(data => setRestaurants(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (restaurants.length === 0) return <p>No restaurants available.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Restaurants</h1>
      <ul className="space-y-2">
        {restaurants.map(r => (
          <li key={r.id}>
            <Link
              className="text-blue-600 hover:underline"
              to={`/r/${r.slug}`}
            >
              {r.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
