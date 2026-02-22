import React from 'react'

export default function ChartMini({ data = [], height = 80 }) {
  if (!data || data.length === 0) return <div style={{height}}>No data</div>
  const max = Math.max(...data.map(d => d.value)) || 1
  const width = 100 / data.length
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{width: '100%', height}}>
      {data.map((d, i) => {
        const h = (d.value / max) * (height - 10)
        const x = i * width
        return (
          <g key={i}>
            <rect x={`${x + 2}%`} y={`${height - h}`} width={`${width - 4}%`} height={h} fill={d.color || '#667eea'} rx="2" />
          </g>
        )
      })}
    </svg>
  )
}
