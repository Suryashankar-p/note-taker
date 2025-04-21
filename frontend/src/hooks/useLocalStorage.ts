import { useEffect } from 'react';

type Callback = (newValue: any, oldValue: any) => void;

export const useLocalStorageListener = (key: string, callback: Callback) => {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        const newValue = event.newValue ? JSON.parse(event.newValue) : null;
        const oldValue = event.oldValue ? JSON.parse(event.oldValue) : null;
        callback(newValue, oldValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, callback]);

  useEffect(() => {
    const handleCustomStorageChange = () => {
      const newValue = localStorage.getItem(key);
      const parsedValue = newValue ? JSON.parse(newValue) : null;
      callback(parsedValue, null);
    };

    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, [key, callback]);
};
