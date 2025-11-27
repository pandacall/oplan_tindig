import { useEffect } from 'react'
import { applyFilters } from '../utils/filterLogic'

function FilterControls({ cellSites, filters, setFilters, setFilteredSites }) {
  // Get unique values for dropdowns
  const cities = ['all', ...new Set(cellSites.map(site => site.city).filter(Boolean).sort())]
  const providers = ['all', 'Globe', 'Smart', 'DITO']
  const statuses = ['all', 'operational', 'non-operational']
  const riskLevels = ['all', 'high', 'medium', 'low']

  // Apply filters whenever they change
  useEffect(() => {
    const filtered = applyFilters(cellSites, filters)
    setFilteredSites(filtered)
  }, [cellSites, filters, setFilteredSites])

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const selectClass = "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filters.city}
          onChange={(e) => handleFilterChange('city', e.target.value)}
          className={selectClass}
          aria-label="Filter by city"
        >
          {cities.map(city => (
            <option key={city} value={city}>
              {city === 'all' ? 'All Cities' : city}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className={selectClass}
          aria-label="Filter by status"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filters.provider}
          onChange={(e) => handleFilterChange('provider', e.target.value)}
          className={selectClass}
          aria-label="Filter by provider"
        >
          {providers.map(provider => (
            <option key={provider} value={provider}>
              {provider === 'all' ? 'All Providers' : provider}
            </option>
          ))}
        </select>

        <select
          value={filters.riskLevel}
          onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
          className={selectClass}
          aria-label="Filter by risk level"
        >
          {riskLevels.map(level => (
            <option key={level} value={level}>
              {level === 'all' ? 'All Risk Levels' : `${level.charAt(0).toUpperCase() + level.slice(1)} Risk`}
            </option>
          ))}
        </select>

        {(filters.city !== 'all' || filters.status !== 'all' || filters.provider !== 'all' || filters.riskLevel !== 'all') && (
          <button
            onClick={() => setFilters({ city: 'all', status: 'all', provider: 'all', riskLevel: 'all' })}
            className="px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear Filters
          </button>
        )}
        
        <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{applyFilters(cellSites, filters).length}</span> of {cellSites.length} sites
        </div>
      </div>
    </div>
  )
}

export default FilterControls
