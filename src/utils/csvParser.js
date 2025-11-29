import Papa from 'papaparse'

export const parseCellSites = async (csvText) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors)
        }
        
        console.log('Raw parsed data:', results.data.length, 'rows')
        console.log('First 3 rows:', results.data.slice(0, 3))
        
        const cellSites = results.data
          .filter(row => {
            const lat = parseFloat(row.Latitude)
            const lon = parseFloat(row.Longitude)
            const hasLat = !isNaN(lat)
            const hasLon = !isNaN(lon)
            
            if (!hasLat || !hasLon) {
              console.warn('Invalid coordinates:', row)
              return false
            }
            
            return true
          })
          .map((row, index) => {
            const siteName = row.Site_Name ? String(row.Site_Name).trim() : 'UNKNOWN'
            
            if (index < 3) {
              console.log(`✅ Mapping row ${index}:`, {
                'Site_Name': row.Site_Name,
                finalSiteName: siteName,
                provider: row.Telco
              })
            }
            
            return {
              siteName: siteName,
              provider: String(row.Telco || 'Unknown').trim(),
              city: extractCity(parseFloat(row.Latitude), parseFloat(row.Longitude)),
              latitude: parseFloat(row.Latitude),
              longitude: parseFloat(row.Longitude),
              status: normalizeStatus(row.Status),
              address: row.address || `${row.Latitude}, ${row.Longitude}`,
              riskLevel: 'unknown'
            }
          })
        
        console.log(`✅ Parsed ${cellSites.length} valid cell sites from CSV`)
        if (cellSites.length > 0) {
          console.log('First 3 sites:', cellSites.slice(0, 3))
          console.log('Provider breakdown:', {
            Globe: cellSites.filter(s => s.provider === 'Globe').length,
            DITO: cellSites.filter(s => s.provider === 'DITO').length,
            Converge: cellSites.filter(s => s.provider === 'Converge').length
          })
        }
        resolve(cellSites)
      },
      error: (error) => {
        console.error('CSV parsing error:', error)
        reject(error)
      }
    })
  })
}

// Normalize status from different formats
const normalizeStatus = (status) => {
  if (!status) return 'online'
  const statusLower = String(status).toLowerCase()
  if (statusLower === 'online' || statusLower === 'operational') {
    return 'online'
  }
  if (statusLower === 'offline' || statusLower === 'non-operational') {
    return 'offline'
  }
  return 'online'
}

// Extract city based on coordinates (NCR areas)
const extractCity = (lat, lon) => {
  // Rough boundaries for NCR cities
  if (lat >= 14.65 && lat <= 14.76 && lon >= 121.0 && lon <= 121.13) return 'Quezon City'
  if (lat >= 14.52 && lat <= 14.58 && lon >= 121.0 && lon <= 121.07) return 'Makati'
  if (lat >= 14.58 && lat <= 14.62 && lon >= 120.97 && lon <= 121.02) return 'Manila'
  if (lat >= 14.50 && lat <= 14.57 && lon >= 121.03 && lon <= 121.10) return 'Taguig'
  if (lat >= 14.48 && lat <= 14.55 && lon >= 121.00 && lon <= 121.08) return 'Pasig'
  if (lat >= 14.52 && lat <= 14.60 && lon >= 120.99 && lon <= 121.05) return 'Mandaluyong'
  if (lat >= 14.54 && lat <= 14.59 && lon >= 120.97 && lon <= 121.00) return 'San Juan'
  if (lat >= 14.40 && lat <= 14.48 && lon >= 121.00 && lon <= 121.11) return 'Muntinlupa'
  if (lat >= 14.48 && lat <= 14.54 && lon >= 121.03 && lon <= 121.12) return 'Parañaque'
  if (lat >= 14.43 && lat <= 14.52 && lon >= 120.98 && lon <= 121.05) return 'Las Piñas'
  
  return 'Metro Manila'
}

export default parseCellSites
