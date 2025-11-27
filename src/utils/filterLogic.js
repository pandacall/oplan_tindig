/**
 * Apply filters to cell sites array
 * Filters use AND logic - all active filters must match
 * @param {Array} cellSites - Array of cell site objects
 * @param {Object} filters - Filter object {city, status, provider, riskLevel}
 * @returns {Array} - Filtered array of cell sites
 */
export function applyFilters(cellSites, filters) {
  return cellSites.filter(site => {
    // City filter
    if (filters.city && filters.city !== 'all' && site.city !== filters.city) {
      return false
    }

    // Status filter
    if (filters.status && filters.status !== 'all' && site.status !== filters.status) {
      return false
    }

    // Provider filter
    if (filters.provider && filters.provider !== 'all' && site.provider !== filters.provider) {
      return false
    }

    // Risk level filter
    if (filters.riskLevel && filters.riskLevel !== 'all' && site.riskLevel !== filters.riskLevel) {
      return false
    }

    return true
  })
}
