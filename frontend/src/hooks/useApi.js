import { useState, useEffect, useCallback } from 'react';

/**
 * Generic API hook that manages loading, data, error, and refetch.
 * 
 * @param {Function} apiFn - The API function to call (must return a promise with { data })
 * @param {Array} deps - Dependencies array — refetches when these change
 * @param {Object} options - { immediate: true/false, enabled: true/false }
 */
const useApi = (apiFn, deps = [], options = {}) => {
  const { immediate = true, enabled = true } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate && enabled);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      setData(res.data);
      return res.data;
    } catch (err) {
      console.error('API Error:', err);
      setError(err?.response?.data?.message || err.message || 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  const refetch = useCallback(() => {
    if (enabled) execute();
  }, [execute, enabled]);

  useEffect(() => {
    if (immediate && enabled) {
      execute();
    }
  }, [...deps, enabled]);

  return { data, loading, error, refetch, execute };
};

export default useApi;
