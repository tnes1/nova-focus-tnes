
import React from 'react'
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className='', ...props }) => (
  <div className={`rounded-2xl border bg-white shadow-sm ${className}`} {...props} />
)
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className='', ...props }) => (
  <div className={`p-4 border-b ${className}`} {...props} />
)
export const CardTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className='', ...props }) => (
  <div className={`text-lg font-semibold ${className}`} {...props} />
)
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className='', ...props }) => (
  <div className={`p-4 ${className}`} {...props} />
)
