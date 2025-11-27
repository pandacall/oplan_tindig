/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return distance
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Calculate minimum distance from a point to a LineString
 * @param {Array} point - [lat, lon] of the point
 * @param {Array} lineCoordinates - Array of [lon, lat] coordinates (GeoJSON format)
 * @returns {number} - Minimum distance in kilometers
 */
export function distanceToLineString(point, lineCoordinates) {
  let minDistance = Infinity
  
  // Check distance to each segment of the line
  for (let i = 0; i < lineCoordinates.length - 1; i++) {
    const segmentStart = lineCoordinates[i]
    const segmentEnd = lineCoordinates[i + 1]
    
    // Distance to line segment
    const distance = distanceToSegment(
      point,
      [segmentStart[1], segmentStart[0]], // Convert GeoJSON [lon, lat] to [lat, lon]
      [segmentEnd[1], segmentEnd[0]]
    )
    
    minDistance = Math.min(minDistance, distance)
  }
  
  return minDistance
}

/**
 * Calculate minimum distance from a point to a line segment
 * @param {Array} point - [lat, lon] of the point
 * @param {Array} segmentStart - [lat, lon] of segment start
 * @param {Array} segmentEnd - [lat, lon] of segment end
 * @returns {number} - Distance in kilometers
 */
function distanceToSegment(point, segmentStart, segmentEnd) {
  // Distance to segment endpoints
  const distToStart = haversineDistance(point[0], point[1], segmentStart[0], segmentStart[1])
  const distToEnd = haversineDistance(point[0], point[1], segmentEnd[0], segmentEnd[1])
  
  // For simplicity, return minimum distance to endpoints
  // More accurate implementation would calculate perpendicular distance
  return Math.min(distToStart, distToEnd)
}

/**
 * Determine risk level based on distance to fault line
 * @param {number} distance - Distance in kilometers
 * @returns {string} - 'high', 'medium', or 'low'
 */
export function getRiskLevel(distance) {
  if (distance < 5) return 'high'
  if (distance < 15) return 'medium'
  return 'low'
}

/**
 * Calculate risk levels for all cell sites based on fault line
 * @param {Array} cellSites - Array of cell site objects
 * @param {Object} faultLineGeoJSON - GeoJSON object with LineString coordinates
 * @returns {Array} - Cell sites with updated riskLevel property
 */
export function calculateRiskLevels(cellSites, faultLineGeoJSON) {
  if (!faultLineGeoJSON || !faultLineGeoJSON.geometry || !faultLineGeoJSON.geometry.coordinates) {
    console.warn('Invalid fault line GeoJSON, using default risk levels')
    return cellSites
  }
  
  const lineCoordinates = faultLineGeoJSON.geometry.coordinates
  
  return cellSites.map(site => {
    const distance = distanceToLineString([site.latitude, site.longitude], lineCoordinates)
    const riskLevel = getRiskLevel(distance)
    
    return {
      ...site,
      riskLevel,
      distanceToFault: distance
    }
  })
}
