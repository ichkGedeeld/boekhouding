'use client'


interface ActionButtonsProps {
  onHistoryClick: () => void
  onRequestClick: () => void
  onFinanceClick: () => void
}

export default function ActionButtons({ onHistoryClick, onRequestClick, onFinanceClick }: ActionButtonsProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="grid grid-cols-3 gap-4">
        {/* History Button */}
        <button
          onClick={onHistoryClick}
          className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border-2 border-blue-200 hover:border-blue-300"
        >
          <svg 
            className="w-8 h-8 text-blue-600 mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span className="text-sm font-medium text-blue-700">Geschiedenis</span>
        </button>

        {/* Request Button */}
        <button
          onClick={onRequestClick}
          className="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border-2 border-orange-200 hover:border-orange-300"
        >
          <svg 
            className="w-8 h-8 text-orange-600 mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" 
            />
          </svg>
          <span className="text-sm font-medium text-orange-700">Verzoeken</span>
        </button>

        {/* Finance Button */}
        <button
          onClick={onFinanceClick}
          className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border-2 border-green-200 hover:border-green-300"
        >
          <svg 
            className="w-8 h-8 text-green-600 mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
            />
          </svg>
          <span className="text-sm font-medium text-green-700">Financiën</span>
        </button>
      </div>
    </div>
  )
}
