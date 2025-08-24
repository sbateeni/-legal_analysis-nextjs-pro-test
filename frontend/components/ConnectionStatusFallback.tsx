import { useState, useEffect } from 'react'

export default function ConnectionStatusFallback() {
  const [status, setStatus] = useState<'checking' | 'no-config' | 'ready'>('checking')

  useEffect(() => {
    checkEnvironment()
  }, [])

  const checkEnvironment = () => {
    const hasUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!hasUrl || !hasKey) {
      setStatus('no-config')
    } else {
      setStatus('ready')
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'ready': return 'bg-green-500'
      case 'no-config': return 'bg-orange-500'
      default: return 'bg-yellow-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'ready': return 'جاهز للإعداد'
      case 'no-config': return 'يتطلب إعداد'
      default: return 'جاري الفحص...'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'ready': return '✅'
      case 'no-config': return '⚠️'
      default: return '🔄'
    }
  }

  if (status === 'no-config') {
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        <span className="text-sm font-medium text-orange-600">
          {getStatusIcon()} Supabase: {getStatusText()}
        </span>
        <button
          onClick={() => window.open('/test-connection', '_blank')}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
          title="إعداد Supabase"
        >
          إعداد
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
      <span className="text-sm font-medium">
        {getStatusIcon()} Supabase: {getStatusText()}
      </span>
    </div>
  )
} 