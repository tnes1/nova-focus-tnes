
import React from 'react'
export const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement> & {variant?: 'secondary'|'default'}> = ({ className='', variant='default', ...props }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${variant==='secondary' ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-white'} ${className}`} {...props} />
)
