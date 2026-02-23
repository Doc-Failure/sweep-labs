import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList } from 'react-window';

function Items() {
  const { items, pagination, fetchItems } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    fetchItems(searchQuery, currentPage, pageSize, () => active)
      .then(() => {
        if (active) setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchItems, searchQuery, currentPage, pageSize]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    setIsLoading(true);
    fetchItems(searchQuery, 1, pageSize)
      .then(() => setIsLoading(false))
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Skeleton loader component
  const SkeletonItem = () => (
    <div className="py-4 border-b border-gray-100 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-48"></div>
    </div>
  );

  // Row component for virtualized list
  const Row = ({ index, style }) => {
    const item = items[index];
    return (
      <div style={style} className="border-b border-gray-100">
        <div className="py-4">
          <Link
            to={'/items/' + item.id}
            className="text-gray-800 hover:text-indigo-600 transition-colors"
          >
            {item.name}
          </Link>
        </div>
      </div>
    );
  };

  if (!pagination && !isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-12">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      {/* Header */}
      <h1 className="text-3xl font-light text-gray-800 mb-8">Items</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-10">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-gray-50 border-0 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-200 rounded"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Items List */}
      <div className="mb-8">
        {isLoading ? (
          <div>
            {Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-gray-400 py-8">No items found</p>
        ) : (
          <div className="border-t border-gray-100">
            <FixedSizeList
              height={Math.min(items.length * 56, 600)}
              itemCount={items.length}
              itemSize={56}
              width="100%"
            >
              {Row}
            </FixedSizeList>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && items.length > 0 && (
        <div className="flex flex-wrap gap-6 items-center justify-between text-sm text-gray-600 pt-4">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="px-2 py-1 bg-gray-50 border-0 rounded focus:outline-none focus:ring-1 focus:ring-indigo-200"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>Total items: {pagination.total}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-1.5 bg-gray-50 rounded hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages || isLoading}
              className="px-4 py-1.5 bg-gray-50 rounded hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Items;