export type Verdict =
  | 'supported'
  | 'partly_supported'
  | 'unsupported'
  | 'contradictory'
  | 'possibly_outdated'
  | 'reference_not_found'
  | 'needs_human_review'

export type SourceAccess = 'metadata_only' | 'abstract_only' | 'full_text' | 'none'

export type ReviewStatus = 'pending' | 'accepted' | 'overridden'

export interface Citation {
  marker: string
  title: string
  authors: string
  year: number | null
  doi: string
  url: string
}

export interface Evidence {
  passage: string
  location: string
  source_access: SourceAccess
}

export type ReviewHistoryEntry =
  | { action: 'accepted'; timestamp: string; verdict: Verdict }
  | {
      action: 'overridden'
      timestamp: string
      from_verdict: Verdict
      to_verdict: Verdict
      reason: string
    }
  | { action: 'note'; timestamp: string; note: string }

export interface Review {
  status: ReviewStatus
  reviewer_note: string
  history: ReviewHistoryEntry[]
}

export interface ClaimResult {
  id: string
  claim: string
  citation: Citation
  evidence: Evidence
  verdict: Verdict
  explanation: string
  confidence: number
  flags: string[]
  review: Review
}

export interface AnalysisDocument {
  title: string
  claims_total: number
}

export interface AnalysisResponse {
  document: AnalysisDocument
  results: ClaimResult[]
}
