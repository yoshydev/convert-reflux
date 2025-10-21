import React from 'react'

interface TabsProps {
  tabs: Array<{
    id: string
    label: string
    icon?: React.ReactNode
  }>
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.icon && (
              <span className="mr-2">{tab.icon}</span>
            )}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default Tabs