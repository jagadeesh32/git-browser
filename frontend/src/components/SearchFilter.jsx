import { useState, useEffect } from 'react';

const SearchFilter = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Sync with parent filters
  useEffect(() => {
    setLocalFilters(filters || {});
  }, [filters]);

  const handleChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);

    // Debounce the actual filter change (500ms)
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      onFilterChange(updated);
    }, 500);

    setDebounceTimer(timer);
  };

  const clearFilters = () => {
    setLocalFilters({});
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    onFilterChange({});
  };

  const activeFilterCount = Object.values(localFilters).filter((v) => v && v !== '').length;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Search & Filter {activeFilterCount > 0 && `(${activeFilterCount} active)`}
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Search Message */}
        <div>
          <label htmlFor="search-message" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Message
          </label>
          <input
            id="search-message"
            type="text"
            value={localFilters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search commit messages..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Author */}
        <div>
          <label htmlFor="filter-author" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Author
          </label>
          <input
            id="filter-author"
            type="text"
            value={localFilters.author || ''}
            onChange={(e) => handleChange('author', e.target.value)}
            placeholder="Filter by author name/email..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* From Date */}
        <div>
          <label htmlFor="filter-since" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            From Date
          </label>
          <input
            id="filter-since"
            type="date"
            value={localFilters.sinceDate || ''}
            onChange={(e) => {
              const timestamp = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : null;
              handleChange('since', timestamp);
              handleChange('sinceDate', e.target.value);
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* To Date */}
        <div>
          <label htmlFor="filter-until" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            To Date
          </label>
          <input
            id="filter-until"
            type="date"
            value={localFilters.untilDate || ''}
            onChange={(e) => {
              const timestamp = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : null;
              handleChange('until', timestamp);
              handleChange('untilDate', e.target.value);
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* File Path */}
        <div className="md:col-span-2">
          <label htmlFor="filter-file" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            File Path
          </label>
          <input
            id="filter-file"
            type="text"
            value={localFilters.file || ''}
            onChange={(e) => handleChange('file', e.target.value)}
            placeholder="Filter by file path (e.g., src/components/App.js)..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
