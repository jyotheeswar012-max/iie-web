import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtINR(amount: number): string {
  if (amount >= 1e7) return `₹${(amount/1e7).toFixed(1)}Cr`
  if (amount >= 1e5) return `₹${(amount/1e5).toFixed(1)}L`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function fmtNumber(n: number): string {
  return n.toLocaleString('en-IN')
}

export function riskColor(level: string): string {
  const map: Record<string, string> = {
    Critical: '#f85149', High: '#e3b341', Medium: '#d29922', Low: '#3fb950'
  }
  return map[level] ?? '#888'
}

export function riskBg(level: string): string {
  const map: Record<string, string> = {
    Critical: 'rgba(248,81,73,0.1)', High: 'rgba(227,179,65,0.1)',
    Medium: 'rgba(210,153,34,0.1)', Low: 'rgba(63,185,80,0.1)'
  }
  return map[level] ?? 'rgba(136,136,136,0.1)'
}
