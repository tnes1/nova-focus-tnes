
import React from 'react'
export const Tabs: React.FC<{value:string, onValueChange:(v:string)=>void, children:React.ReactNode}> = ({value, onValueChange, children}) => <div data-value={value}>{children}</div>
export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({className='', children}) => <div className={`rounded-xl bg-slate-100 p-1 ${className}`}>{children}</div>
export const TabsTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {value:string}> = ({value, children, className='', onClick, ...props}) => (
  <button className={`w-full rounded-lg px-3 py-2 text-sm data-[active=true]:bg-white data-[active=true]:shadow`} data-active={props['data-active']} onClick={onClick} {...props}>
    {children}
  </button>
)
export const TabsContent: React.FC<{value:string, children:React.ReactNode}> = ({children}) => <div className='mt-3'>{children}</div>
