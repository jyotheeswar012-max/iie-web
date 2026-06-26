'use client'
import { motion } from 'framer-motion'

const STORIES = [
  {
    name: 'Raju Patil', loc: 'Barmer, Rajasthan · Cotton · 8 acres', emoji: '\ud83c\udf3b',
    before: '\ud83d\udd34 46.4\u00b0C heatwave hit June 12. Cotton crop wilting within 48 hours.',
    after:  '\u2705 IIE detected trigger at 06:14. Policy matched. \u20b948,200 credited by 07:51.',
    payout: '\u20b948,200', time: 'Settled in 97 minutes',
  },
  {
    name: 'Anita Devi', loc: 'Puri, Odisha · Paddy · 4 acres', emoji: '\ud83c\udf3e',
    before: '\ud83d\udd34 Cyclone Remal: 218mm rain in 6 hours. Fields submerged.',
    after:  '\u2705 Flood trigger verified at 03:32 via IMD + NASA. \u20b932,800 credited at 05:18.',
    payout: '\u20b932,800', time: 'Settled in 106 minutes',
  },
  {
    name: 'Vijay Singh', loc: 'Ludhiana, Punjab · Wheat · 12 acres', emoji: '\ud83c\udf3f',
    before: '\ud83d\udfe0 NDVI reading 0.24 \u2014 well below drought threshold of 0.30.',
    after:  '\u2705 Drought confirmed across 3/4 sources. \u20b962,500 sent before Vijay woke up.',
    payout: '\u20b962,500', time: 'Settled in 78 minutes',
  },
]

export default function FarmerStories() {
  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">👨‍🌾 Real Farmer. Real Payout. Real Story.</h2>
      <div className="space-y-4">
        {STORIES.map((s, i) => (
          <motion.div key={s.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="bg-white rounded-2xl p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1a237e] to-[#64ffda]" />
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{s.emoji}</span>
              <div>
                <div className="font-black text-[#1a237e] text-base">{s.name}</div>
                <div className="text-xs text-gray-400">{s.loc}</div>
              </div>
            </div>
            <div className="bg-red-50 rounded-xl px-4 py-2.5 text-sm text-gray-700 mb-2">{s.before}</div>
            <div className="bg-green-50 rounded-xl px-4 py-2.5 text-sm text-gray-700 mb-3">{s.after}</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-green-700">{s.payout}</span>
              <span className="text-xs text-gray-400">⏱️ {s.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
