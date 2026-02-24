import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = e => {
    e.preventDefault();
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          navigate('/');
        } else {
          setError(data.error || 'login failed');
        }
      })
      .catch(err => setError('network error'));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="border p-1 w-full"
          />
        </div>
        <div>
          <label className="block">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-1 w-full"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white">
          Login
        </button>
      </form>
    </div>
  );
}
