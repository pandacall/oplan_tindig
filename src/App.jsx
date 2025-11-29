import { useState, useEffect } from 'react'
import TopNav from './components/TopNav'
import Map from './components/Map'
import FilterControls from './components/FilterControls'
import StatsPanel from './components/StatsPanel'
import CSVUploader from './components/CSVUploader'
import { parseCellSites } from './utils/csvParser'
import { calculateRiskLevels } from './utils/geoCalculations'

// Combined data from Globe, DITO, and Converge
const sampleDataUrl = '/combined-cellsites.csv'
const CACHE_VERSION = 'v3' // Changed to v3 to force reload

function App() {
  const [theme, setTheme] = useState('light')
  const [cellSites, setCellSites] = useState([])
  const [filteredSites, setFilteredSites] = useState([])
  const [filters, setFilters] = useState({
    city: 'all',
    status: 'all',
    provider: 'all',
    riskLevel: 'all'
  })
  const [statsOpen, setStatsOpen] = useState(false)
  const [dataTimestamp, setDataTimestamp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mapFullscreen, setMapFullscreen] = useState(false)

  // Load sample data on mount
  useEffect(() => {
    loadSampleData()
  }, [])

  const loadSampleData = async () => {
    try {
      setLoading(true)
      
      // Check localStorage first with version
      const cacheKey = `cellSitesData_${CACHE_VERSION}`
      const cachedData = localStorage.getItem(cacheKey)
      
      // FOR DEBUGGING - Always load from CSV during development
      const forceReload = true // Set to false in production
      
      if (cachedData && !forceReload) {
        const parsed = JSON.parse(cachedData)
        console.log('Loaded', parsed.sites.length, 'cell sites from cache (v' + CACHE_VERSION + ')')
        setCellSites(parsed.sites)
        setFilteredSites(parsed.sites)
        setDataTimestamp(new Date(parsed.timestamp))
        setLoading(false)
        return
      }
      
      // Clear old cache versions
      console.log('Clearing old cache versions...')
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cellSitesData_')) {
          console.log('Removing:', key)
          localStorage.removeItem(key)
        }
      })
      
      // Load from CSV
      console.log('Loading from CSV:', sampleDataUrl)
      const response = await fetch(sampleDataUrl + '?v=' + Date.now()) // Cache bust
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status}`)
      }
      const csvText = await response.text()
      console.log('CSV loaded, length:', csvText.length)
      
      let sites = await parseCellSites(csvText)
      console.log('Parsed sites:', sites.length)
      
      // Load fault line and calculate risk levels
      try {
        const faultResponse = await fetch('/fault-line.geojson')
        const faultData = await faultResponse.json()
        sites = calculateRiskLevels(sites, faultData)
        console.log('Calculated risk levels based on fault line distance')
      } catch (err) {
        console.warn('Could not calculate risk levels:', err)
      }
      
      console.log('Final loaded sites:', sites.length)
      console.log('Provider breakdown:', {
        Globe: sites.filter(s => s.provider === 'Globe').length,
        DITO: sites.filter(s => s.provider === 'DITO').length,
        Converge: sites.filter(s => s.provider === 'Converge').length
      })
      
      setCellSites(sites)
      setFilteredSites(sites)
      const now = new Date()
      setDataTimestamp(now)
      
      // Persist to localStorage with version
      localStorage.setItem(cacheKey, JSON.stringify({
        sites,
        timestamp: now.toISOString()
      }))
      console.log('Cached data with version:', CACHE_VERSION)
    } catch (error) {
      console.error('Error loading sample data:', error)
      alert('Failed to load sample data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCSVUpload = async (newSites) => {
    try {
      // Calculate risk levels for uploaded data
      const faultResponse = await fetch('/fault-line.geojson')
      const faultData = await faultResponse.json()
      const sitesWithRisk = calculateRiskLevels(newSites, faultData)
      
      setCellSites(sitesWithRisk)
      setFilteredSites(sitesWithRisk)
      const now = new Date()
      setDataTimestamp(now)
      
      // Persist to localStorage
      localStorage.setItem('cellSitesData', JSON.stringify({
        sites: sitesWithRisk,
        timestamp: now.toISOString()
      }))
      
      console.log('Uploaded and processed', sitesWithRisk.length, 'cell sites')
    } catch (error) {
      console.error('Error processing uploaded data:', error)
      // Fallback: use data without risk calculation
      setCellSites(newSites)
      setFilteredSites(newSites)
      setDataTimestamp(new Date())
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const clearCache = () => {
    if (confirm('Clear cached data and reload from CSV?')) {
      localStorage.removeItem('cellSitesData')
      loadSampleData()
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {!mapFullscreen && (
        <TopNav 
          theme={theme}
          onThemeToggle={toggleTheme}
          highRiskCount={filteredSites.filter(s => s.riskLevel === 'high').length}
        />
      )}
      
      {loading && (
        <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300 text-lg">Loading cell site data...</p>
          </div>
        </div>
      )}
      
      {!mapFullscreen && (
        <FilterControls 
          cellSites={cellSites}
          filters={filters}
          setFilters={setFilters}
          setFilteredSites={setFilteredSites}
        />
      )}

      {/* Map in fullscreen mode - fixed positioning */}
      {mapFullscreen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <Map 
            cellSites={filteredSites} 
            selectedCity={filters.city}
            isFullscreen={mapFullscreen}
            onToggleFullscreen={() => setMapFullscreen(!mapFullscreen)}
          />
        </div>
      )}

      {/* Desktop: side-by-side layout */}
      {/* Mobile: stacked layout */}
      {!mapFullscreen && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="h-1/2 lg:h-full lg:flex-1 relative">
            <Map 
              cellSites={filteredSites} 
              selectedCity={filters.city}
              isFullscreen={mapFullscreen}
              onToggleFullscreen={() => setMapFullscreen(!mapFullscreen)}
            />
          </div>
          
          <div className="flex-1 lg:flex-initial lg:h-full overflow-y-auto">
            <StatsPanel 
              cellSites={filteredSites}
              isOpen={statsOpen}
              onToggle={() => setStatsOpen(!statsOpen)}
              dataTimestamp={dataTimestamp}
              onClearCache={clearCache}
            />
          </div>
        </div>
      )}

      {/* Desktop fullscreen mode */}
      {mapFullscreen && (
        <div className="hidden lg:flex flex-1 flex-col lg:flex-row overflow-hidden">
          <div className="h-full lg:flex-1 relative">
            <Map 
              cellSites={filteredSites} 
              selectedCity={filters.city}
              isFullscreen={mapFullscreen}
              onToggleFullscreen={() => setMapFullscreen(!mapFullscreen)}
            />
          </div>
          
          <div className="lg:flex-initial lg:h-full lg:w-80 overflow-y-auto">
            <StatsPanel 
              cellSites={filteredSites}
              isOpen={statsOpen}
              onToggle={() => setStatsOpen(!statsOpen)}
              dataTimestamp={dataTimestamp}
              onClearCache={clearCache}
            />
          </div>
        </div>
      )}

      <CSVUploader onDataLoad={handleCSVUpload} />
    </div>
  )
}

export default App
