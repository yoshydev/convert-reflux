import React from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, Loader } from 'lucide-react'

interface StatusIndicatorProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  message: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  type,
  message,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const baseClasses = 'flex items-center rounded-lg border'

  const typeClasses = {
    success: 'bg-success-50 border-success-200 text-success-700',
    error: 'bg-error-50 border-error-200 text-error-700',
    warning: 'bg-warning-50 border-warning-200 text-warning-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    loading: 'bg-gray-50 border-gray-200 text-gray-700',
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const getIcon = () => {
    const iconClass = `${iconSizeClasses[size]} mr-2 flex-shrink-0`

    switch (type) {
      case 'success':
        return <CheckCircle className={iconClass} />
      case 'error':
        return <XCircle className={iconClass} />
      case 'warning':
        return <AlertCircle className={iconClass} />
      case 'info':
        return <Info className={iconClass} />
      case 'loading':
        return <Loader className={`${iconClass} animate-spin`} />
      default:
        return null
    }
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${sizeClasses[size]} ${className}`}>
      {showIcon && getIcon()}
      <span className="flex-1">{message}</span>
    </div>
  )
}

export default StatusIndicator