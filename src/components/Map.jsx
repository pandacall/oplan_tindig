import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Tooltip, Circle, Polyline, Polygon, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useMemo } from 'react'
import CellSitePopup from './CellSitePopup'
import { Maximize2, Minimize2 } from 'lucide-react'
import * as turf from '@turf/turf'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons - white circles with colored borders and label
const createMarkerIcon = (borderColor, label = '') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; display: inline-block;">
        <div style="background-color: white; width: 16px; height: 16px; border-radius: 50%; border: 3px solid ${borderColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
        ${label ? `<div style="position: absolute; top: -24px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.3); pointer-events: none;">${label}</div>` : ''}
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })
}

// Staging area icon - circle with 'S' inside and label
const createStagingAreaIcon = (label = '') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; display: inline-block;">
        <div style="background-color: white; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #3b82f6; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; color: #3b82f6;">S</div>
        ${label ? `<div style="position: absolute; top: -28px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.3); pointer-events: none;">${label}</div>` : ''}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
}

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

function Map({ 
  cellSites, 
  stagingAreas = [], 
  selectedCity, 
  selectedStatus, 
  selectedProvider,
  showStagingAreas = true,
  showRiskZones = true,
  showHighRisk = true,
  showMediumRisk = true,
  isFullscreen, 
  onToggleFullscreen 
}) {
  const [faultLineData, setFaultLineData] = useState(null)
  // NCR (Metro Manila) center coordinates
  const center = [14.5995, 120.9842]
  
  // Responsive zoom based on screen size - zoom to NCR level
  const isMobile = window.innerWidth < 768
  const initialZoom = isMobile ? 10 : 11

  // Load simplified fault line GeoJSON
  useEffect(() => {
    fetch('/Big_one_simplified.geojson')
      .then(res => res.json())
      .then(data => setFaultLineData(data))
      .catch(err => console.error('Error loading fault line:', err))
  }, [])

  const faultLineStyle = {
    color: '#ef4444',
    weight: 3,
    opacity: 0.8
  }

  // Convert GeoJSON coordinates [lon, lat] to Leaflet format [lat, lon]
  const convertCoordinates = (coords) => {
    return coords.map(coord => [coord[1], coord[0]])
  }

  // Create buffer polygons using Turf.js - keep as individual polygons
  const bufferPolygons = useMemo(() => {
    if (!faultLineData || !faultLineData.features) return { highRisk: [], mediumRisk: [] }
    
    console.log('Creating buffers for', faultLineData.features.length, 'features')
    
    const highRiskBuffers = []
    const mediumRiskBuffers = []
    
    faultLineData.features.forEach((feature, index) => {
      if (feature.geometry && feature.geometry.type === 'LineString') {
        try {
          // Create 5km buffer for high risk (red)
          const highRiskBuffer = turf.buffer(feature, 5, { units: 'kilometers' })
          if (highRiskBuffer) {
            highRiskBuffers.push(highRiskBuffer)
            console.log(`High risk buffer ${index + 1} created`)
          }
          
          // Create 15km buffer for medium risk (yellow)
          const mediumRiskBuffer = turf.buffer(feature, 15, { units: 'kilometers' })
          if (mediumRiskBuffer) {
            mediumRiskBuffers.push(mediumRiskBuffer)
            console.log(`Medium risk buffer ${index + 1} created`)
          }
        } catch (err) {
          console.error('Error creating buffer for feature', index, ':', err)
        }
      }
    })
    
    console.log('Created buffers:', { high: highRiskBuffers.length, medium: mediumRiskBuffers.length })
    
    return { highRisk: highRiskBuffers, mediumRisk: mediumRiskBuffers }
  }, [faultLineData])

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
        
        {/* Risk Zones - Medium (15km buffer) - Yellow */}
        {showRiskZones && showMediumRisk && bufferPolygons.mediumRisk.map((buffer, index) => (
          <GeoJSON
            key={`medium-risk-zone-${index}`}
            data={buffer}
            style={{
              color: '#d97706',
              fillColor: '#f59e0b',
              fillOpacity: 0.15,
              weight: 2,
              opacity: 0.6
            }}
            className="risk-zone-medium"
          />
        ))}
        
        {/* Risk Zones - High (5km buffer) - Red */}
        {showRiskZones && showHighRisk && bufferPolygons.highRisk.map((buffer, index) => (
          <GeoJSON
            key={`high-risk-zone-${index}`}
            data={buffer}
            style={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.12,
              weight: 2,
              opacity: 0.4
            }}
            className="risk-zone-high"
          />
        ))}
        
        {/* Fault Line */}
        {faultLineData && (
          <GeoJSON 
            data={faultLineData} 
            style={faultLineStyle}
          />
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
          {cellSites.map((site, index) => {
            const siteIcon = createMarkerIcon(
              site.status === 'online' ? '#10b981' : '#ef4444',
              site.siteName
            )
            return (
              <Marker
                key={index}
                position={[site.latitude, site.longitude]}
                icon={siteIcon}
                cellSite={site}
              >
                <Popup>
                  <CellSitePopup site={site} />
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>
        
        {/* Staging Area Markers with Clustering */}
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
            const count = cluster.getChildCount()
            return L.divIcon({
              html: `
                <div style="position: relative; width: 44px; height: 44px;">
                  <svg width="44" height="44" style="position: absolute; top: 0; left: 0;">
                    <circle cx="22" cy="22" r="19" fill="none" stroke="#3b82f6" stroke-width="4"/>
                  </svg>
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background-color: white; width: 34px; height: 34px; border-radius: 50%; 
                    display: flex; align-items: center; justify-content: center; font-weight: bold; 
                    font-size: 13px; color: #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                    ${count}
                  </div>
                </div>
              `,
              className: 'custom-cluster-icon',
              iconSize: L.point(44, 44, true)
            })
          }}
        >
          {stagingAreas.map((area, index) => {
            const areaIcon = createStagingAreaIcon(area.name)
            return (
              <Marker
                key={`staging-${index}`}
                position={[area.latitude, area.longitude]}
                icon={areaIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-sm text-blue-600 mb-1">{area.name}</h3>
                    <div className="text-xs space-y-0.5">
                      <p><span className="font-semibold">Type:</span> {area.function}</p>
                      {area.location && <p><span className="font-semibold">Location:</span> {area.location}</p>}
                      <p><span className="font-semibold">City:</span> {area.city}</p>
                      <p className="text-gray-500">
                        {area.latitude.toFixed(6)}, {area.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}

export default Map
