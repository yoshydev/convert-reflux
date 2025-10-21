import { FileText } from 'lucide-react'
import React from 'react'

export function Header() {
  return (
    <header className="text-center mb-12 animate-fade-in">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4 shadow-medium">
        <FileText className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-3 text-balance">
        Reflux Converter
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
        TSVファイルをCSVに変換してGoogle Driveに自動アップロード
      </p>
    </header>
  )
}