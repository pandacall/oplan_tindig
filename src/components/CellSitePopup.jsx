function CellSitePopup({ site }) {
  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'high': return 'text-red-600 dark:text-red-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-green-600 dark:text-green-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusColor = (status) => {
    return status === 'operational' 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="text-sm space-y-1 min-w-[200px]">
      {site.siteId && (
        <div>
          <span className="font-semibold">Site ID:</span> {site.siteId}
        </div>
      )}
      <div>
        <span className="font-semibold">Provider:</span> {site.provider}
      </div>
      <div>
        <span className="font-semibold">City:</span> {site.city}
      </div>
      <div>
        <span className="font-semibold">Status:</span> 
        <span className={`ml-1 font-medium ${getStatusColor(site.status)}`}>
          {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
        </span>
      </div>
      <div>
        <span className="font-semibold">Risk Level:</span> 
        <span className={`ml-1 font-medium ${getRiskColor(site.riskLevel)}`}>
          {site.riskLevel.charAt(0).toUpperCase() + site.riskLevel.slice(1)}
        </span>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
        {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
      </div>
      {site.address && (
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
          {site.address}
        </div>
      )}
    </div>
  )
}

export default CellSitePopup
