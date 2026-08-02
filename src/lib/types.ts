export interface Project {
  id: string
  user_id: string
  title: string
  book_type: 'puzzle' | 'coloring'
  status: 'draft' | 'active' | 'completed' | 'ready'
  current_stage: string
  stage_progress: Record<string, 'pending' | 'in-progress' | 'done'>
  config: Record<string, any>
  metadata: BookMetadata
  cover_config: CoverConfig
  compliance_report: Record<string, any>
  quality_score: number | null
  archived: boolean
  created_at: string
  updated_at: string
}

export interface BookMetadata {
  title?: string
  subtitle?: string
  description?: string
  short_description?: string
  author?: string
  series?: string
  edition?: string
  language?: string
  reading_age?: string
  audience?: string
  keywords?: string[]
  categories?: string[]
  bisac?: string[]
}

export interface CoverConfig {
  trimSize?: string
  theme?: string
  primaryColor?: string
  title?: string
  subtitle?: string
  author?: string
  pageCount?: number
  bleed?: boolean
}

export interface Template {
  id: string
  name: string
  category: string
  config: Record<string, any>
  is_builtin: boolean
}

export interface Asset {
  id: string
  name: string
  type: string
  tags: string[]
  metadata: Record<string, any>
  created_at: string
}

export interface ActivityEntry {
  id: string
  action: string
  detail: string | null
  project_id: string | null
  created_at: string
}
