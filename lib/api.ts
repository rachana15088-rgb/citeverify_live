import mockResults from '@/mock/results.json'
import type { AnalysisResponse } from '@/lib/types'

const STORAGE_KEY = 'citeverify:analysis'
const MOCK_LATENCY_MS = 700

export function saveResults(data: AnalysisResponse | null, sample = false): boolean {
  try {
    const key = sample ? `${STORAGE_KEY}:sample` : STORAGE_KEY
    if (data) sessionStorage.setItem(key, JSON.stringify(data))
    else sessionStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/** A new identity prevents SWR from serving the previous upload. */
export function analysisCacheKey(sample = false): string {
  if (sample) return 'analysis:sample'
  const saved = sessionStorage.getItem(STORAGE_KEY)
  return `analysis:saved:${saved ?? 'empty'}`
}

/** Send the uploaded PDF to our /api/analyze route. */
export async function analyzeFile(file: File): Promise<AnalysisResponse> {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch('/api/analyze', { method: 'POST', body })
  let json: any = null
  try {
    json = await res.json()
  } catch {
    // response was not JSON
  }
  if (!res.ok) throw new Error(json?.error || `Analysis failed (${res.status})`)
  if (!Array.isArray(json?.results)) throw new Error("Invalid analysis response")
  return json as AnalysisResponse
}

/**
 * Single entry point for results.
 * Real analysis if one was saved, otherwise the sample data.
 * To use the Python backend later, replace the body with a fetch to it.
 */
export async function getResults(sample = false): Promise<AnalysisResponse> {
  try {
    const saved = sessionStorage.getItem(sample ? `${STORAGE_KEY}:sample` : STORAGE_KEY)
    if (saved) return JSON.parse(saved) as AnalysisResponse
  } catch {
    // ignore and fall back to the sample
  }
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))
  return structuredClone(mockResults) as AnalysisResponse
}