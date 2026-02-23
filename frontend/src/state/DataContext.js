import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);

  const fetchItems = useCallback(async (searchQuery = '', page = 1, pageSize = 20, shouldUpdate = () => true) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', pageSize);
    if (searchQuery) {
      params.append('q', searchQuery);
    }

    const res = await fetch(`http://localhost:5000/api/items?${params.toString()}`);
    const json = await res.json();
    if (shouldUpdate()) {
      setItems(json.items || []);
      setPagination(json.pagination || null);
    }
  }, []);

  return (
    <DataContext.Provider value={{ items, pagination, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);