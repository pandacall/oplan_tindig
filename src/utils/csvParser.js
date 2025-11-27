import Papa from 'papaparse'

/**
 * Parse CSV file or text containing cell site data
 * Expected CSV columns: siteId, provider, city, latitude, longitude, status, address (optional)
 * @param {File|string} input - CSV file object or CSV text string
 * @returns {Promise<Array>} - Array of cell site objects
 */
export async function parseCellSites(input) {
  return new Promise((resolve, reject) => {
    Papa.parse(input, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        try {
          const cellSites = results.data.map((row, index) => {
            // Parse coordinates
            const latitude = parseFloat(row.latitude)
            const longitude = parseFloat(row.longitude)
            
            // Validate required fields
            if (isNaN(latitude) || isNaN(longitude)) {
              console.warn(`Row ${index + 1}: Invalid coordinates`, row)
              return null
            }

            if (!row.provider || !row.city) {
              console.warn(`Row ${index + 1}: Missing provider or city`, row)
              return null
            }

            // Normalize status
            const status = (row.status || 'operational').toLowerCase()
            if (status !== 'operational' && status !== 'non-operational') {
              console.warn(`Row ${index + 1}: Invalid status "${status}", defaulting to operational`)
            }

            // Calculate risk level (placeholder - will be replaced with actual geo calculations)
            const riskLevel = row.risklevel ? row.risklevel.toLowerCase() : 'low'

            return {
              siteId: row.siteid || `SITE-${index + 1}`,
              provider: row.provider,
              city: row.city,
              latitude,
              longitude,
              status: status === 'non-operational' ? 'non-operational' : 'operational',
              riskLevel: ['high', 'medium', 'low'].includes(riskLevel) ? riskLevel : 'low',
              address: row.address || ''
            }
          }).filter(site => site !== null)

          console.log(`Parsed ${cellSites.length} cell sites from CSV`)
          resolve(cellSites)
        } catch (error) {
          reject(new Error(`CSV parsing error: ${error.message}`))
        }
      },
      error: (error) => {
        reject(new Error(`CSV file reading error: ${error.message}`))
      }
    })
  })
}
