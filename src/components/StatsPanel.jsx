import { RefreshCw } from 'lucide-react'

function StatsPanel({ cellSites, isOpen, onToggle, dataTimestamp, onClearCache }) {
  const total = cellSites.length
  const operational = cellSites.filter(s => s.status === 'operational').length
  const nonOperational = cellSites.filter(s => s.status === 'non-operational').length
  const highRisk = cellSites.filter(s => s.riskLevel === 'high').length
  const mediumRisk = cellSites.filter(s => s.riskLevel === 'medium').length
  const lowRisk = cellSites.filter(s => s.riskLevel === 'low').length

  return (
    <>
      {/* Desktop Stats Panel - Sidebar */}
      <div className="hidden lg:block lg:w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-3 space-y-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              Cell Site Statistics
            </h2>
            
            {dataTimestamp && (
              <div className="space-y-1 mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Data loaded: {dataTimestamp.toLocaleString()}
                </p>
                {onClearCache && (
                  <button
                    onClick={onClearCache}
                    className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Clear cache & reload</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800/50 backdrop-blur-sm">
            <div className="text-xs text-blue-700 dark:text-blue-300 mb-0.5 font-medium">Total Cell Sites</div>
            <div className="text-2xl font-black text-blue-900 dark:text-blue-100">{total}</div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Operational Status
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800/50 backdrop-blur-sm">
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Operational</span>
                <span className="text-base font-black text-green-600 dark:text-green-400">{operational}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-lg border border-red-200 dark:border-red-800/50 backdrop-blur-sm">
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Non-operational</span>
                <span className="text-base font-black text-red-600 dark:text-red-400">{nonOperational}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Risk Distribution
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-950/50 dark:to-rose-950/50 rounded-lg border-2 border-red-300 dark:border-red-700 backdrop-blur-sm shadow-sm">
                <span className="text-xs text-gray-800 dark:text-gray-200 font-semibold">High Risk (&lt;5km)</span>
                <span className="text-lg font-black text-red-700 dark:text-red-300">{highRisk}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-950/50 dark:to-orange-950/50 rounded-lg border-2 border-yellow-300 dark:border-yellow-700 backdrop-blur-sm shadow-sm">
                <span className="text-xs text-gray-800 dark:text-gray-200 font-semibold">Medium Risk (5-15km)</span>
                <span className="text-lg font-black text-yellow-700 dark:text-yellow-300">{mediumRisk}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-lg border-2 border-green-300 dark:border-green-700 backdrop-blur-sm shadow-sm">
                <span className="text-xs text-gray-800 dark:text-gray-200 font-semibold">Low Risk (&gt;15km)</span>
                <span className="text-lg font-black text-green-700 dark:text-green-300">{lowRisk}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Map Legend
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Non-operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full opacity-30"></div>
                <span className="text-gray-700 dark:text-gray-300">High risk zone</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Medium risk zone</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                Markers cluster at lower zoom. Click to zoom in.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Stats Panel - Below Map */}
      <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-3 space-y-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Cell Site Statistics
          </h2>
          
          {/* Compact grid layout for mobile */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-2 rounded-lg border border-blue-200 dark:border-blue-800/50">
              <div className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">Total</div>
              <div className="text-xl font-black text-blue-900 dark:text-blue-100">{total}</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-2 rounded-lg border border-green-200 dark:border-green-800/50">
              <div className="text-[10px] text-green-700 dark:text-green-300 font-medium">Active</div>
              <div className="text-xl font-black text-green-600 dark:text-green-400">{operational}</div>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 p-2 rounded-lg border border-red-200 dark:border-red-800/50">
              <div className="text-[10px] text-red-700 dark:text-red-300 font-medium">Down</div>
              <div className="text-xl font-black text-red-600 dark:text-red-400">{nonOperational}</div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Risk Distribution
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex flex-col items-center p-2 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-950/50 dark:to-rose-950/50 rounded-lg border border-red-300 dark:border-red-700">
                <span className="text-[10px] text-gray-800 dark:text-gray-200 font-semibold">High</span>
                <span className="text-lg font-black text-red-700 dark:text-red-300">{highRisk}</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-950/50 dark:to-orange-950/50 rounded-lg border border-yellow-300 dark:border-yellow-700">
                <span className="text-[10px] text-gray-800 dark:text-gray-200 font-semibold">Medium</span>
                <span className="text-lg font-black text-yellow-700 dark:text-yellow-300">{mediumRisk}</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 rounded-lg border border-green-300 dark:border-green-700">
                <span className="text-[10px] text-gray-800 dark:text-gray-200 font-semibold">Low</span>
                <span className="text-lg font-black text-green-700 dark:text-green-300">{lowRisk}</span>
              </div>
            </div>
          </div>

          {dataTimestamp && (
            <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                Data loaded: {dataTimestamp.toLocaleString()}
              </p>
              {onClearCache && (
                <button
                  onClick={onClearCache}
                  className="flex items-center space-x-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline mt-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear cache & reload</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default StatsPanel
