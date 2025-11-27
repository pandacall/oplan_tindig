import { describe, it, expect } from 'vitest'
import { haversineDistance, getRiskLevel, calculateRiskLevels } from '../src/utils/geoCalculations'

describe('geoCalculations', () => {
  describe('haversineDistance', () => {
    it('should calculate distance between two points', () => {
      // Distance between Manila and Quezon City (approximately 11km)
      const distance = haversineDistance(14.5995, 120.9842, 14.6760, 121.0437)
      expect(distance).toBeGreaterThan(10)
      expect(distance).toBeLessThan(15)
    })

    it('should return 0 for same coordinates', () => {
      const distance = haversineDistance(14.5995, 120.9842, 14.5995, 120.9842)
      expect(distance).toBe(0)
    })
  })

  describe('getRiskLevel', () => {
    it('should return high for distance < 5km', () => {
      expect(getRiskLevel(3)).toBe('high')
      expect(getRiskLevel(4.9)).toBe('high')
    })

    it('should return medium for distance 5-15km', () => {
      expect(getRiskLevel(5)).toBe('medium')
      expect(getRiskLevel(10)).toBe('medium')
      expect(getRiskLevel(14.9)).toBe('medium')
    })

    it('should return low for distance > 15km', () => {
      expect(getRiskLevel(15)).toBe('low')
      expect(getRiskLevel(20)).toBe('low')
    })
  })

  describe('calculateRiskLevels', () => {
    it('should calculate risk levels for cell sites', () => {
      const cellSites = [
        { latitude: 14.6760, longitude: 121.0437, provider: 'Globe', city: 'Quezon City' }
      ]
      
      const faultLineGeoJSON = {
        geometry: {
          coordinates: [
            [121.0437, 14.6760], // Very close to the cell site
            [121.0500, 14.6800]
          ]
        }
      }

      const result = calculateRiskLevels(cellSites, faultLineGeoJSON)
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('riskLevel')
      expect(result[0]).toHaveProperty('distanceToFault')
      expect(typeof result[0].distanceToFault).toBe('number')
    })

    it('should handle invalid fault line data gracefully', () => {
      const cellSites = [
        { latitude: 14.6760, longitude: 121.0437, provider: 'Globe', city: 'Quezon City' }
      ]
      
      const result = calculateRiskLevels(cellSites, null)
      expect(result).toEqual(cellSites)
    })
  })
})
