import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Try to fetch restaurant info
      fetchRestaurantInfo(savedToken);
    }
    setLoading(false);
  }, []);

  const fetchRestaurantInfo = async (authToken) => {
    try {
      const res = await fetch('/api/pos/restaurant', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-restaurant-id': JSON.parse(localStorage.getItem('user')).restaurantId,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setRestaurantInfo(data);
      }
    } catch (err) {
      console.error('Failed to fetch restaurant info:', err);
    }
  };

  const login = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    fetchRestaurantInfo(token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRestaurantInfo(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, restaurantInfo, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
