import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'

interface WebVitalsMetric {
  name: string
  value: number
  delta: number
  id: string
  entries: PerformanceEntry[]
  attribution?: unknown
}

function reportWebVitals(onPerfEntry?: (metric: WebVitalsMetric) => void) {
  if (!onPerfEntry || typeof onPerfEntry !== 'function') return
  onCLS(onPerfEntry)
  onFID(onPerfEntry)
  onFCP(onPerfEntry)
  onLCP(onPerfEntry)
  onTTFB(onPerfEntry)
}

export default reportWebVitals
