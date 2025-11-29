import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Circle, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import CellSitePopup from './CellSitePopup'
import { Maximize2, Minimize2 } from 'lucide-react'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons - white circles with colored borders
const createMarkerIcon = (borderColor) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: white; width: 16px; height: 16px; border-radius: 50%; border: 3px solid ${borderColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })
}

const onlineIcon = createMarkerIcon('#10b981')
const offlineIcon = createMarkerIcon('#ef4444')

// Component to handle map zoom when city changes
function MapUpdater({ cellSites, selectedCity }) {
  const map = useMap()
  
  useEffect(() => {
    if (selectedCity && selectedCity !== 'all' && cellSites.length > 0) {
      // Filter sites by selected city
      const citySites = cellSites.filter(site => site.city === selectedCity)
      
      if (citySites.length > 0) {
        // Create bounds from all sites in the city
        const bounds = L.latLngBounds(
          citySites.map(site => [site.latitude, site.longitude])
        )
        
        // Fit map to bounds with padding
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 13
        })
      }
    } else if (selectedCity === 'all') {
      // Reset to NCR (Metro Manila) when "all" is selected
      map.setView([14.5995, 120.9842], window.innerWidth < 768 ? 10 : 11)
    }
  }, [selectedCity, cellSites, map])
  
  return null
}

function Map({ cellSites, selectedCity, isFullscreen, onToggleFullscreen }) {
  const [faultLineData, setFaultLineData] = useState(null)
  // NCR (Metro Manila) center coordinates
  const center = [14.5995, 120.9842]
  
  // Responsive zoom based on screen size - zoom to NCR level
  const isMobile = window.innerWidth < 768
  const initialZoom = isMobile ? 10 : 11

  // Load fault line GeoJSON
  useEffect(() => {
    fetch('/fault-line.geojson')
      .then(res => res.json())
      .then(data => setFaultLineData(data))
      .catch(err => console.error('Error loading fault line:', err))
  }, [])

  const faultLineStyle = {
    color: '#ef4444',
    weight: 3,
    opacity: 0.8
  }

  // Extract coordinates for risk zone visualization
  const getRiskZonePoints = () => {
    if (!faultLineData || !faultLineData.geometry) return []
    const coords = faultLineData.geometry.coordinates
    // Sample every 3rd point to avoid too many circles
    return coords.filter((_, index) => index % 3 === 0)
  }

  return (
    <div className="relative h-full w-full">
      {/* Fullscreen Toggle Button - Mobile Only, Top Right */}
      <button
        onClick={onToggleFullscreen}
        className="lg:hidden absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 p-2.5 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? (
          <Minimize2 className="w-5 h-5 text-gray-900 dark:text-white" />
        ) : (
          <Maximize2 className="w-5 h-5 text-gray-900 dark:text-white" />
        )}
      </button>

      <MapContainer 
        center={center} 
        zoom={initialZoom} 
        className="h-full w-full"
        zoomControl={true}
        minZoom={5}
        maxZoom={18}
        scrollWheelZoom={true}
        touchZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Fault Line */}
        {faultLineData && (
          <>
            <GeoJSON 
              data={faultLineData} 
              style={faultLineStyle}
            />
            
            {/* Risk Zones - High (5km) and Medium (15km) */}
            {getRiskZonePoints().map((coord, index) => (
              <div key={`risk-zone-${index}`}>
                <Circle
                  center={[coord[1], coord[0]]}
                  radius={5000}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.05,
                    weight: 1,
                    opacity: 0.2
                  }}
                />
                <Circle
                  center={[coord[1], coord[0]]}
                  radius={15000}
                  pathOptions={{
                    color: '#f59e0b',
                    fillColor: '#f59e0b',
                    fillOpacity: 0.03,
                    weight: 1,
                    opacity: 0.15
                  }}
                />
              </div>
            ))}
          </>
        )}
        
        {/* Map Updater for city zoom */}
        <MapUpdater cellSites={cellSites} selectedCity={selectedCity} />
        
        {/* Cell Site Markers with Clustering */}
        <MarkerClusterGroup
          chunkedLoading={true}
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          disableClusteringAtZoom={14}
          animate={true}
          animateAddingMarkers={false}
          removeOutsideVisibleBounds={true}
          iconCreateFunction={(cluster) => {
            const markers = cluster.getAllChildMarkers()
            const onlineCount = markers.filter(marker => {
              return marker.options.cellSite && marker.options.cellSite.status === 'online'
            }).length
            
            const totalCount = markers.length
            const onlinePercentage = (onlineCount / totalCount) * 100
            const redDegrees = ((totalCount - onlineCount) / totalCount) * 360
            const greenDegrees = 360 - redDegrees
            
            return L.divIcon({
              html: `
                <div style="position: relative; width: 44px; height: 44px;">
                  <svg width="44" height="44" style="position: absolute; top: 0; left: 0; transform: rotate(-90deg);">
                    <circle cx="22" cy="22" r="19" fill="none" stroke="#ef4444" stroke-width="4" 
                      stroke-dasharray="${redDegrees * 0.331} ${greenDegrees * 0.331}" 
                      stroke-linecap="butt"/>
                    <circle cx="22" cy="22" r="19" fill="none" stroke="#10b981" stroke-width="4" 
                      stroke-dasharray="${greenDegrees * 0.331} ${redDegrees * 0.331}" 
                      stroke-dashoffset="${-redDegrees * 0.331}"
                      stroke-linecap="butt"/>
                  </svg>
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background-color: white; width: 34px; height: 34px; border-radius: 50%; 
                    display: flex; align-items: center; justify-content: center; font-weight: bold; 
                    font-size: 13px; color: #374151; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                    ${totalCount}
                  </div>
                </div>
              `,
              className: 'custom-cluster-icon',
              iconSize: L.point(44, 44, true)
            })
          }}
        >
          {cellSites.map((site, index) => (
            <Marker
              key={index}
              position={[site.latitude, site.longitude]}
              icon={site.status === 'online' ? onlineIcon : offlineIcon}
              cellSite={site}
            >
              <Popup>
                <CellSitePopup site={site} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}

export default Map
