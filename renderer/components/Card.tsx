import React from 'react'

interface CardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'soft' | 'medium' | 'strong'
  hover?: boolean
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  padding = 'md',
  shadow = 'soft',
  hover = false,
}) => {
  const baseClasses = 'bg-white rounded-xl border border-gray-200 transition-all duration-200'

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const shadowClasses = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    strong: 'shadow-strong',
  }

  const hoverClasses = hover ? 'hover:shadow-medium hover:-translate-y-1' : ''

  return (
    <div className={`${baseClasses} ${shadowClasses[shadow]} ${hoverClasses} ${className}`}>
      {(title || subtitle) && (
        <div className={`${paddingClasses[padding]} border-b border-gray-100 pb-4 mb-4`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className={!title && !subtitle ? paddingClasses[padding] : 'px-6 pb-6'}>
        {children}
      </div>
    </div>
  )
}

export default Card