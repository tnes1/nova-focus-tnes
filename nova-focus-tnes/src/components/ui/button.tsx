
import React from 'react'
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default'|'secondary'|'ghost', size?: 'sm'|'md' }
export const Button: React.FC<Props> = ({ variant='default', size='md', className='', ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-xl font-medium transition active:scale-[.98] focus:outline-none focus:ring px-4 py-2'
  const color = variant==='secondary' ? 'bg-slate-100 hover:bg-slate-200 text-slate-900'
            : variant==='ghost' ? 'bg-transparent hover:bg-slate-100 text-slate-700'
            : 'bg-slate-900 hover:bg-slate-800 text-white'
  const sz = size==='sm' ? 'text-sm px-3 py-1.5' : ''
  return <button className={`${base} ${color} ${sz} ${className}`} {...props} />
}
