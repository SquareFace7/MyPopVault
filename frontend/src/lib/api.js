export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://api.mypopvault.online';

export const getApiUrl = (path) => {
  if (!path) return BACKEND_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
};

export const apiFetch = (path, options) => {
  return fetch(getApiUrl(path), options);
};
