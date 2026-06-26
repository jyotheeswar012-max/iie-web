'use client'
import { useEffect, useState } from 'react'

const BASE_ITEMS = [
  { label: 'NDVI · Barmer RJ',    value: '0.21',       color: '#f85149' },
  { label: 'RAIN · Puri OD',      value: '187mm',      color: '#82b1ff' },
  { label: 'TEMP · Latur MH',     value: '46.2°C',     color: '#e3b341' },
  { label: 'WIND · Adilabad TG',  value: '78km/h',     color: '#e040fb' },
  { label: 'PAYOUT · Warangal',   value: '₹12,400 ✓',  color: '#3fb950' },
  { label: 'ENROLLED · Today',    value: '+341 farmers',color: '#64ffda' },
  { label: 'NDVI · Jodhpur RJ',   value: '0.28',       color: '#e3b341' },
  { label: 'RAIN · Nashik MH',    value: '142mm',      color: '#82b1ff' },
  { label: 'TRIGGER · Barmer RJ', value: 'DROUGHT ⚠',  color: '#f85149' },
  { label: 'PAYOUT · Khammam TG', value: '₹8,900 ✓',   color: '#3fb950' },
  { label: 'SOIL · Aurangabad',   value: 'Moisture 18%',color: '#64ffda' },
  { label: 'TEMP · Jaipur RJ',    value: '43.8°C',     color: '#e3b341' },
]

export default function SatelliteTicker() {
  const [items] = useState([...BASE_ITEMS, ...BASE_ITEMS])
  return (
    <div className="border-y border-brand-border bg-brand-dark overflow-hidden py-2.5">
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-xs font-mono">
            <span className="text-brand-muted">{item.label}</span>
            <span style={{ color: item.color }} className="font-bold">{item.value}</span>
            <span className="text-brand-border mx-2">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
