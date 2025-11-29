import { useState, useEffect } from 'react'
import TopNav from './components/TopNav'
import Map from './components/Map'
import FilterControls from './components/FilterControls'
import StatsPanel from './components/StatsPanel'
import CSVUploader from './components/CSVUploader'
import { parseCellSites } from './utils/csvParser'
import { calculateRiskLevels } from './utils/geoCalculations'

// Sample data - will be replaced by CSV upload
const sampleDataUrl = '/sample-cellsites.csv'

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
      
      // Check localStorage first
      const cachedData = localStorage.getItem('cellSitesData')
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        console.log('Loaded', parsed.sites.length, 'cell sites from cache')
        setCellSites(parsed.sites)
        setFilteredSites(parsed.sites)
        setDataTimestamp(new Date(parsed.timestamp))
        setLoading(false)
        return
      }
      
      // Load from CSV
      const response = await fetch(sampleDataUrl)
      const csvText = await response.text()
      let sites = await parseCellSites(csvText)
      
      // Load fault line and calculate risk levels
      try {
        const faultResponse = await fetch('/fault-line.geojson')
        const faultData = await faultResponse.json()
        sites = calculateRiskLevels(sites, faultData)
        console.log('Calculated risk levels based on fault line distance')
      } catch (err) {
        console.warn('Could not calculate risk levels:', err)
      }
      
      console.log('Loaded', sites.length, 'cell sites')
      setCellSites(sites)
      setFilteredSites(sites)
      const now = new Date()
      setDataTimestamp(now)
      
      // Persist to localStorage
      localStorage.setItem('cellSitesData', JSON.stringify({
        sites,
        timestamp: now.toISOString()
      }))
    } catch (error) {
      console.error('Error loading sample data:', error)
      alert('Failed to load sample data. Please check console for details.')
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
      <TopNav 
        theme={theme}
        onThemeToggle={toggleTheme}
        highRiskCount={filteredSites.filter(s => s.riskLevel === 'high').length}
      />
      
      {loading && (
        <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300 text-lg">Loading cell site data...</p>
          </div>
        </div>
      )}
      
      <FilterControls 
        cellSites={cellSites}
        filters={filters}
        setFilters={setFilters}
        setFilteredSites={setFilteredSites}
      />

      {/* Desktop: side-by-side layout */}
      {/* Mobile: stacked layout with fullscreen toggle */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className={`${mapFullscreen ? 'h-full' : 'h-1/2'} lg:h-full lg:flex-1 relative`}>
          <Map 
            cellSites={filteredSites} 
            selectedCity={filters.city}
            isFullscreen={mapFullscreen}
            onToggleFullscreen={() => setMapFullscreen(!mapFullscreen)}
          />
        </div>
        
        <div className={`${mapFullscreen ? 'hidden' : 'flex-1'} lg:flex lg:flex-initial lg:h-full overflow-y-auto`}>
          <StatsPanel 
            cellSites={filteredSites}
            isOpen={statsOpen}
            onToggle={() => setStatsOpen(!statsOpen)}
            dataTimestamp={dataTimestamp}
            onClearCache={clearCache}
          />
        </div>
      </div>

      <CSVUploader onDataLoad={handleCSVUpload} />
    </div>
  )
}

export default App
