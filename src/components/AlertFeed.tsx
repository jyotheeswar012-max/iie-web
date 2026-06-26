'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ALERTS } from '@/lib/mockData'

const levelStyle: Record<string, string> = {
  CRITICAL: 'border-l-[#f85149] bg-red-950/40',
  WARNING:  'border-l-[#e3b341] bg-yellow-950/30',
  SAFE:     'border-l-[#3fb950] bg-green-950/30',
}

export default function AlertFeed() {
  const [alerts, setAlerts] = useState(ALERTS)

  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert = {
        icon: ['\ud83d\udd34','\ud83d\udfe0','\ud83d\udfe2'][Math.floor(Math.random()*3)],
        district: ['Barmer, RJ','Nashik, MH','Puri, OD','Warangal, TG'][Math.floor(Math.random()*4)],
        message: 'Live satellite reading updated',
        level: ['CRITICAL','WARNING','SAFE'][Math.floor(Math.random()*3)],
        minsAgo: 0,
        payout: null,
      }
      setAlerts(prev => [newAlert, ...prev.slice(0, 9)])
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">🛡️ Live Alert Feed</h2>
        <div className="flex items-center gap-2 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
          <span className="text-[#3fb950] text-xs font-bold">LIVE</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
        <AnimatePresence>
          {alerts.map((a, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 rounded-xl p-3.5 border-l-4 ${levelStyle[a.level] ?? 'border-l-gray-500 bg-white/5'}`}
            >
              <span className="text-xl mt-0.5">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm">{a.district}</div>
                <div className="text-white/60 text-xs mt-0.5 leading-relaxed">{a.message}</div>
                <div className="text-white/30 text-[10px] mt-1">{a.minsAgo === 0 ? 'just now' : `${a.minsAgo}m ago`} &middot; {a.level}</div>
              </div>
              {a.payout && (
                <div className="text-green-400 font-bold text-sm whitespace-nowrap self-center">{a.payout}</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
