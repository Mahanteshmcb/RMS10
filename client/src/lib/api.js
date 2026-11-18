const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const socketBaseUrl = (
  import.meta.env.VITE_SOCKET_URL ||
  apiBaseUrl ||
  window.location.origin
).replace(/\/+$/, '');

export function apiFetch(input, init) {
  const url = typeof input === 'string' && input.startsWith('/api/')
    ? `${apiBaseUrl}${input}`
    : input;

  return fetch(url, init);
}
