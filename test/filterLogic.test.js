import { describe, it, expect } from 'vitest'
import { applyFilters } from '../src/utils/filterLogic'

describe('filterLogic', () => {
  const sampleSites = [
    { city: 'Manila', status: 'operational', provider: 'Globe', riskLevel: 'high' },
    { city: 'Quezon City', status: 'non-operational', provider: 'Smart', riskLevel: 'medium' },
    { city: 'Makati', status: 'operational', provider: 'DITO', riskLevel: 'low' },
    { city: 'Manila', status: 'operational', provider: 'Globe', riskLevel: 'medium' }
  ]

  describe('applyFilters', () => {
    it('should return all sites when all filters are "all"', () => {
      const filters = { city: 'all', status: 'all', provider: 'all', riskLevel: 'all' }
      const result = applyFilters(sampleSites, filters)
      expect(result).toHaveLength(4)
    })

    it('should filter by city', () => {
      const filters = { city: 'Manila', status: 'all', provider: 'all', riskLevel: 'all' }
      const result = applyFilters(sampleSites, filters)
      expect(result).toHaveLength(2)
      expect(result.every(site => site.city === 'Manila')).toBe(true)
    })

    it('should filter by status', () => {
      const filters = { city: 'all', status: 'operational', provider: 'all', riskLevel: 'all' }
      const result = applyFilters(sampleSites, filters)
      expect(result).toHaveLength(3)
      expect(result.every(site => site.status === 'operational')).toBe(true)
    })

    it('should filter by provider', () => {
      const filters = { city: 'all', status: 'all', provider: 'Globe', riskLevel: 'all' }
      const result = applyFilters(sampleSites, filters)
      expect(result).toHaveLength(2)
      expect(result.every(site => site.provider === 'Globe')).toBe(true)
    })

    it('should filter by risk level', () => {
      const filters = { city: 'all', status: 'all', provider: 'all', riskLevel: 'high' }
      const result = applyFilters(sampleSites, filters)
      expect(result).toHaveLength(1)
      expect(result[0].riskLevel).toBe('high')
    })

    it('should apply multiple filters with AND logic', () => {
      const filters = { city: 'Manila', status: 'operational', provider: 'Globe', riskLevel: 'all' }
      const result = applyFilters(sampleSites, filters)
      expect(result).toHaveLength(2)
      expect(result.every(site => 
        site.city === 'Manila' && 
        site.status === 'operational' && 
        site.provider === 'Globe'
      )).toBe(true)
    })

    it('should return empty array when no matches', () => {
      const filters = { city: 'Taguig', status: 'all', provider: 'all', riskLevel: 'all' }
      const result = applyFilters(sampleSites, filters)
      expect(result).toHaveLength(0)
    })
  })
})
