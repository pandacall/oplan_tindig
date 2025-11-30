import Papa from 'papaparse'
import * as turf from '@turf/turf'

// Load GeoJSON boundaries - these will be fetched once and cached
let boundariesLoaded = false
let ncrBoundaries = null
let regionIIIBoundaries = null
let regionIVABoundaries = null

// Load all three GeoJSON boundary files
const loadBoundaries = async () => {
  if (boundariesLoaded) return
  
  try {
    console.log('Loading official Philippine administrative boundaries...')
    
    // Load NCR boundaries
    const ncrResponse = await fetch('/ncr_dists_citi_muni.geojson')
    ncrBoundaries = await ncrResponse.json()
    console.log(`✅ Loaded NCR: ${ncrBoundaries.features.length} municipalities`)
    
    // Load Region III boundaries
    const region3Response = await fetch('/iii_prov_citi_muni.geojson')
    regionIIIBoundaries = await region3Response.json()
    console.log(`✅ Loaded Region III: ${regionIIIBoundaries.features.length} municipalities`)
    
    // Load Region IVA boundaries
    const region4aResponse = await fetch('/iva_prov_citi_muni.geojson')
    regionIVABoundaries = await region4aResponse.json()
    console.log(`✅ Loaded Region IVA: ${regionIVABoundaries.features.length} municipalities`)
    
    boundariesLoaded = true
    console.log('✅ All administrative boundaries loaded successfully')
  } catch (error) {
    console.error('❌ Error loading boundaries:', error)
    throw error
  }
}

export const parseCellSites = async (csvText) => {
  // Ensure boundaries are loaded before parsing
  await loadBoundaries()
  
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
            
            const location = extractLocation(parseFloat(row.Latitude), parseFloat(row.Longitude))
            
            return {
              siteName: siteName,
              provider: String(row.Telco || 'Unknown').trim(),
              city: location.city,
              province: location.province,
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

// Province code mapping (adm2_psgc to province name)
const PROVINCE_MAP = {
  // NCR (Metro Manila) - all use same region code
  1300000000: 'Metro Manila',
  
  // Region III (Central Luzon)
  300800000: 'Bataan',
  301400000: 'Bulacan',
  303400000: 'Nueva Ecija',
  305400000: 'Pampanga',
  306900000: 'Tarlac',
  307100000: 'Zambales',
  307700000: 'Aurora',
  
  // Region IVA (CALABARZON)
  401000000: 'Batangas',
  402100000: 'Cavite',
  403400000: 'Laguna',
  404500000: 'Quezon',
  405800000: 'Rizal'
}

// Extract city and province using point-in-polygon with official GeoJSON boundaries
const extractLocation = (lat, lon) => {
  // Create a Turf.js point from the coordinates
  const point = turf.point([lon, lat]) // GeoJSON uses [longitude, latitude] order
  
  // Check NCR boundaries first
  if (ncrBoundaries) {
    for (const feature of ncrBoundaries.features) {
      try {
        if (turf.booleanPointInPolygon(point, feature.geometry)) {
          const cityName = feature.properties.adm3_en
          const adm1Code = feature.properties.adm1_psgc
          const province = PROVINCE_MAP[adm1Code] || 'Metro Manila'
          return { city: cityName, province }
        }
      } catch (error) {
        console.warn('Error checking NCR boundary:', error)
      }
    }
  }
  
  // Check Region III boundaries
  if (regionIIIBoundaries) {
    for (const feature of regionIIIBoundaries.features) {
      try {
        if (turf.booleanPointInPolygon(point, feature.geometry)) {
          const cityName = feature.properties.adm3_en
          const adm2Code = feature.properties.adm2_psgc
          const province = PROVINCE_MAP[adm2Code] || 'Unknown Province'
          return { city: cityName, province }
        }
      } catch (error) {
        console.warn('Error checking Region III boundary:', error)
      }
    }
  }
  
  // Check Region IVA boundaries
  if (regionIVABoundaries) {
    for (const feature of regionIVABoundaries.features) {
      try {
        if (turf.booleanPointInPolygon(point, feature.geometry)) {
          const cityName = feature.properties.adm3_en
          const adm2Code = feature.properties.adm2_psgc
          const province = PROVINCE_MAP[adm2Code] || 'Unknown Province'
          return { city: cityName, province }
        }
      } catch (error) {
        console.warn('Error checking Region IVA boundary:', error)
      }
    }
  }
  
  // If no match found in any region
  return { city: 'Unknown', province: 'Unknown' }
}

// Parse staging areas from CSV
export const parseStagingAreas = async (csvText) => {
  // Ensure boundaries are loaded before parsing
  await loadBoundaries()
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors)
        }
        
        console.log('Raw parsed staging areas:', results.data.length, 'rows')
        
        const stagingAreas = results.data
          .filter(row => {
            const lat = parseFloat(row.Latitude)
            const lon = parseFloat(row.Longitude)
            const hasLat = !isNaN(lat) && lat !== 0
            const hasLon = !isNaN(lon) && lon !== 0
            
            if (!hasLat || !hasLon) {
              console.warn('Invalid staging area coordinates:', row)
              return false
            }
            
            return true
          })
          .map((row, index) => {
            const name = row.LGU_Site_Name ? String(row.LGU_Site_Name).trim() : 'Unknown Staging Area'
            const func = row.Function ? String(row.Function).trim() : 'Staging Area'
            const location = extractLocation(parseFloat(row.Latitude), parseFloat(row.Longitude))
            
            return {
              name: name,
              function: func,
              location: row.Location || '',
              latitude: parseFloat(row.Latitude),
              longitude: parseFloat(row.Longitude),
              city: location.city,
              province: location.province
            }
          })
        
        console.log(`✅ Parsed ${stagingAreas.length} valid staging areas from CSV`)
        if (stagingAreas.length > 0) {
          console.log('First staging area:', stagingAreas[0])
        }
        resolve(stagingAreas)
      },
      error: (error) => {
        console.error('CSV parsing error:', error)
        reject(error)
      }
    })
  })
}

export default parseCellSites
