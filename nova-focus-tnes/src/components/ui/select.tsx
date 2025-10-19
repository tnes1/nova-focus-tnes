
import React from 'react'
export const Select: React.FC<{value:string, onValueChange:(v:string)=>void, children:React.ReactNode}> = ({value, onValueChange, children}) => (
  <div className='relative'>
    <select value={value} onChange={e=>onValueChange(e.target.value)} className='appearance-none w-full rounded-xl border px-3 py-2 pr-8 text-base'>
      {children}
    </select>
    <div className='pointer-events-none absolute right-2 top-0 h-full flex items-center'>▾</div>
  </div>
)
export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({className='', ...props}) => <div className={className} {...props} />
export const SelectValue: React.FC = () => null
export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({children}) => <>{children}</>
export const SelectItem: React.FC<React.OptionHTMLAttributes<HTMLOptionElement>> = (props) => <option {...props} />
