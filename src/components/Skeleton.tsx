'use client';
import { CSSProperties } from 'react';

export function Skeleton({ w, h, r = 8, style }: { w?: number|string; h: number|string; r?: number; style?: CSSProperties }) {
  return (
    <div style={{ width: w ?? '100%', height: h, borderRadius: r,
      background:'linear-gradient(90deg,#0f172a 25%,#1e293b 50%,#0f172a 75%)',
      backgroundSize:'800px 100%', animation:'shimmer 1.5s infinite', ...style }} />
  );
}

export function CardSkeleton({ rows = 3, height = 120 }: { rows?: number; height?: number }) {
  return (
    <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:14, padding:'16px 18px' }}>
      <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
      <Skeleton h={14} w='60%' style={{ marginBottom:14 }} />
      {Array.from({ length: rows }).map((_,i) => <Skeleton key={i} h={height/rows - 6} style={{ marginBottom:8 }} />)}
    </div>
  );
}

export function AgentCardSkeleton() {
  return (
    <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:'14px 16px' }}>
      <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
        <Skeleton h={14} w='40%' />
        <Skeleton h={14} w={60} />
      </div>
      <Skeleton h={8} r={4} style={{ marginBottom:8 }} />
      <div style={{ display:'flex', gap:6 }}>
        {[70,80,60,50].map(w => <Skeleton key={w} h={20} w={w} r={4} />)}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:14, overflow:'hidden' }}>
      <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', gap:10 }}>
        {[120,80,80,80,100].map(w => <Skeleton key={w} h={12} w={w} />)}
      </div>
      {Array.from({ length: rows }).map((_,i) => (
        <div key={i} style={{ padding:'12px 16px', borderBottom:'1px solid #0f172a', display:'flex', gap:10 }}>
          {[120,80,80,80,100].map(w => <Skeleton key={w} h={12} w={w} />)}
        </div>
      ))}
    </div>
  );
}
