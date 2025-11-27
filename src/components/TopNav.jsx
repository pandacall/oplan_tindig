import { Sun, Moon } from 'lucide-react'

function TopNav({ theme, onThemeToggle, highRiskCount }) {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4 relative shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left side - Logos */}
        <div className="flex items-center space-x-3">
          <img 
            src="/dict-logo.png" 
            alt="DICT Logo" 
            className="h-12 w-12 object-contain"
          />
          <img 
            src="/bagong-pilipinas-logo.png" 
            alt="Bagong Pilipinas Logo" 
            className="h-12 w-12 object-contain"
          />
        </div>
        
        {/* Center - Title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-2xl font-black bg-gradient-to-r from-gray-800 via-orange-600 to-orange-800 bg-clip-text text-transparent tracking-tight">
            PROJECT TINDIG
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium tracking-wide">
            Telco Infrastructure & Disaster Intelligence Grid
          </p>
        </div>
      </div>
      
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-all hover:scale-105"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-900" />
          ) : (
            <Sun className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </nav>
  )
}

export default TopNav
