import { useState, useEffect } from 'react'
import { checkSupabaseConnection } from '../utils/supabase-config'

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'failed'>('checking')
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkConnection = async () => {
    setStatus('checking')
    try {
      // التحقق من وجود المتغيرات البيئية أولاً
      const hasEnvVars = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!hasEnvVars) {
        setStatus('failed')
        setLastCheck(new Date())
        return
      }
      
      const isConnected = await checkSupabaseConnection()
      setStatus(isConnected ? 'connected' : 'failed')
      setLastCheck(new Date())
    } catch (error) {
      setStatus('failed')
      setLastCheck(new Date())
    }
  }

  useEffect(() => {
    checkConnection()
    
    // فحص الاتصال كل دقيقة
    const interval = setInterval(checkConnection, 60000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-yellow-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'متصل'
      case 'failed': return 'فشل الاتصال'
      default: return 'جاري الفحص...'
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
      <span className="text-sm font-medium">
        Supabase: {getStatusText()}
      </span>
      {lastCheck && (
        <span className="text-xs text-gray-500">
          آخر فحص: {lastCheck.toLocaleTimeString('ar-SA')}
        </span>
      )}
      <button
        onClick={checkConnection}
        className="text-xs text-blue-600 hover:text-blue-800 underline"
      >
        إعادة فحص
      </button>
    </div>
  )
} 