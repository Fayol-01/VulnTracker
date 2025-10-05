import React from 'react';
import { Filter, X } from 'lucide-react';

const FilterPanel = ({ 
  filters, 
  setFilters, 
  filterOptions, 
  isOpen, 
  setIsOpen,
  applyFilters 
}) => {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    const emptyFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    setFilters(emptyFilters);
    applyFilters(emptyFilters);
  };

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
      >
        <Filter className="w-4 h-4" />
        <span>Filter</span>
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {filterOptions.map(({ key, label, type, options }) => (
              <div key={key} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {label}
                </label>
                {type === 'select' ? (
                  <select
                    value={filters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
                  >
                    <option value="">All</option>
                    {options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={type}
                    value={filters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
                    placeholder={`Filter by ${label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
            <button
              onClick={() => {
                applyFilters(filters);
                setIsOpen(false);
              }}
              className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;