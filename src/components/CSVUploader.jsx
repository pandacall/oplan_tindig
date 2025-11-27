import { Upload } from 'lucide-react'
import { parseCellSites } from '../utils/csvParser'

function CSVUploader({ onDataLoad }) {
  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const cellSites = await parseCellSites(file)
      onDataLoad(cellSites)
      
      // Reset file input to allow re-uploading the same file
      event.target.value = ''
    } catch (error) {
      console.error('Error processing CSV:', error)
      alert('Error processing CSV file. Please check the format and try again.')
    }
  }

  return (
    <div className="absolute bottom-6 left-6 z-10">
      <label 
        htmlFor="csv-upload"
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer transition-colors"
      >
        <Upload className="w-5 h-5" />
        <span className="text-sm font-medium">Upload CSV</span>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  )
}

export default CSVUploader
