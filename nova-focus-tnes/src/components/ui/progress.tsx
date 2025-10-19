
import React from 'react'
export const Progress: React.FC<{value:number}> = ({value}) => (
  <div className='h-2 w-full rounded-full bg-slate-200 overflow-hidden'>
    <div className='h-full bg-slate-900' style={{width: `${Math.max(0, Math.min(100, value))}%`}} />
  </div>
)
