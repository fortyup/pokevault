const API_BASE_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

const buildUrl = (path, params) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);
  if (params && params.toString()) {
    url.search = params.toString();
  }
  return url.toString();
};

const buildSearchParams = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null) {
      return;
    }

    if (Array.isArray(rawValue)) {
      rawValue
        .map((value) => (typeof value === 'string' ? value.trim() : value))
        .filter((value) => value !== undefined && value !== null && value !== '')
        .forEach((value) => params.append(key, String(value)));
      return;
    }

    const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;

    if (value === '' || Number.isNaN(value)) {
      return;
    }

    params.append(key, String(value));
  });

  return params;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`Erreur réseau (${response.status})`);
  }

  const payload = await response.json();

  if (payload && payload.success === false) {
    throw new Error(payload.error || 'Réponse API invalide');
  }

  return payload;
};

export const fetchAdvancedCards = async (filters = {}) => {
  const params = buildSearchParams(filters);
  const url = buildUrl('/cards', params);
  const payload = await handleResponse(await fetch(url));
  return {
    cards: payload?.data || [],
    pagination: payload?.pagination || { page: 1, limit: 0, total: 0, pages: 0 }
  };
};

export const fetchSeriesList = async () => {
  const url = buildUrl('/series', new URLSearchParams({ limit: '200' }));
  const payload = await handleResponse(await fetch(url));
  return payload?.data || [];
};

export const fetchSetsList = async (filters = {}) => {
  const params = buildSearchParams({ ...filters, limit: filters.limit || 500 });
  const url = buildUrl('/sets', params);
  const payload = await handleResponse(await fetch(url));
  return payload?.data || [];
};

export const fetchCardsMetadata = async () => {
  const url = buildUrl('/cards/metadata');
  const payload = await handleResponse(await fetch(url));
  return payload?.data || {};
};
