import { useState, useCallback } from 'react';

export default function useLocalStorage(namespace, key, initialValue) {
  const storageKey = key ? `${namespace}_${key}` : namespace;

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(storageKey, JSON.stringify(valueToStore));
    } catch (e) {
      console.error('useLocalStorage error:', e);
    }
  }, [storageKey, storedValue]);

  return [storedValue, setValue];
}
