
import React from 'react'
export const Switch: React.FC<{checked:boolean, onCheckedChange:(v:boolean)=>void}> = ({checked, onCheckedChange}) => (
  <button onClick={()=>onCheckedChange(!checked)} aria-pressed={checked}
    className={`h-6 w-11 rounded-full transition relative ${checked?'bg-slate-900':'bg-slate-300'}`}>
    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked?'left-6':'left-0.5'}`}></span>
  </button>
)
