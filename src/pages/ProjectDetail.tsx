import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { WORKFLOW_STAGES, stageIndex } from '../lib/constants'
import { Project } from '../lib/types'
import { Spinner } from '../components/ui'
import { downloadInteriorPDF, downloadCoverPDF } from '../lib/pdf'
import { validateCompliance, runQualityChecks } from '../lib/validators'
import { generateMetadata, generateMetadataWithAI } from '../lib/metadata'
import { CircleCheck as CheckCircle2, Circle, Clock, ChevronRight, ArrowLeft, Download, FileText, ShieldCheck, Gauge, Save, History, Sparkles } from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, session } = useAuth()
  const { notify } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [versions, setVersions] = useState<{ id: string; label: string | null; created_at: string }[]>([])
  const [showVersions, setShowVersions] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    const { data } = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
    setProject(data as Project | null)
    const { data: v } = await supabase.from('project_versions').select('id, label, created_at').eq('project_id', id).order('created_at', { ascending: false }).limit(10)
    setVersions(v ?? [])
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const saveProject = useCallback(async (updates: Partial<Project>, logAction?: string) => {
    if (!project || !id) return
    setSaving(true)
    await supabase.from('projects').update(updates).eq('id', id)
    if (logAction && user) {
      await supabase.from('activity_log').insert({ user_id: user.id, project_id: id, action: logAction, detail: project.title })
    }
    setProject({ ...project, ...updates })
    setSaving(false)
  }, [project, id, user])

  const setStage = async (stageId: string) => {
    if (!project) return
    const progress = { ...project.stage_progress, [project.current_stage]: 'done' as const, [stageId]: 'in-progress' as const }
    const status = stageId === 'ready-for-kdp' ? 'ready' : stageId === 'export' ? 'completed' : 'active'
    await saveProject({ current_stage: stageId, stage_progress: progress, status }, `Advanced to ${stageId}`)
    notify(`Stage updated to ${WORKFLOW_STAGES.find((s) => s.id === stageId)?.label}`, 'success')
  }

  const saveVersion = async () => {
    if (!project || !id || !user) return
    await supabase.from('project_versions').insert({ project_id: id, user_id: user.id, config: project.config, label: `Manual save ${new Date().toLocaleString()}` })
    const { data: v } = await supabase.from('project_versions').select('id, label, created_at').eq('project_id', id).order('created_at', { ascending: false }).limit(10)
    setVersions(v ?? [])
    notify('Version saved.', 'success')
  }

  if (loading) return <div className="p-10"><Spinner /></div>
  if (!project) return <div className="p-10 text-center text-fg-muted">Project not found. <Link to="/projects" className="text-brand-600">Back to projects</Link></div>

  const currentIdx = stageIndex(project.current_stage)
  const progress = Math.round(((currentIdx + 1) / WORKFLOW_STAGES.length) * 100)

  const exportConfig = {
    puzzleType: project.config.puzzleType ?? 'wordsearch',
    difficulty: project.config.difficulty ?? 'easy',
    pageCount: project.config.pageCount ?? 60,
    trimSize: project.config.trimSize ?? '8.5x11',
    largePrint: project.config.largePrint ?? false,
    theme: project.config.coloringTheme ?? 'animals',
    title: project.metadata?.title || project.title,
    author: project.metadata?.author || '',
    gridSize: project.config.gridSize,
    wordList: project.config.wordList,
  }

  const coverConfig = {
    trimSize: project.cover_config?.trimSize ?? '6x9',
    title: project.metadata?.title || project.title,
    author: project.metadata?.author || '',
    subtitle: project.metadata?.subtitle || '',
    primaryColor: project.cover_config?.primaryColor ?? '#3478f6',
    pageCount: project.config.pageCount ?? 60,
    theme: project.cover_config?.theme ?? 'minimal',
  }

  const complianceIssues = validateCompliance(exportConfig)
  const quality = runQualityChecks(exportConfig)

  const runCompliance = async () => {
    await saveProject({ compliance_report: { issues: complianceIssues, checkedAt: new Date().toISOString() } }, 'Ran compliance validation')
    notify('Compliance validation complete.', 'success')
  }

  const runQuality = async () => {
    await saveProject({ quality_score: quality.score }, 'Ran quality checks')
    notify(`Quality score: ${quality.score}/100`, 'success')
  }

  const [generatingMeta, setGeneratingMeta] = useState(false)

  const generateMeta = async () => {
    setGeneratingMeta(true)
    try {
      const meta = await generateMetadataWithAI({ topic: project.title, bookType: project.book_type, audience: project.config.audience ?? 'adult', difficulty: project.config.difficulty ?? 'easy', accessToken: session?.access_token ?? null })
      await saveProject({ metadata: { ...project.metadata, ...meta } }, 'Generated metadata with AI')
      notify('AI metadata generated.', 'success')
    } catch (err: any) {
      notify('AI generation failed, using template. ' + (err.message ?? ''), 'error')
      const meta = generateMetadata({ topic: project.title, bookType: project.book_type, audience: project.config.audience ?? 'adult', difficulty: project.config.difficulty ?? 'easy' })
      await saveProject({ metadata: { ...project.metadata, ...meta } }, 'Generated metadata')
    } finally {
      setGeneratingMeta(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-4"><ArrowLeft className="w-4 h-4" /> Back to Projects</Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-fg">{project.title}</h1>
          <p className="text-sm text-fg-muted mt-1">{project.book_type === 'puzzle' ? 'Puzzle Book' : 'Coloring Book'} \u00b7 {project.status}</p>
        </div>
        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-fg-muted flex items-center gap-1"><Save className="w-3.5 h-3.5 animate-pulse" /> Saving\u2026</span>}
          <button onClick={saveVersion} className="btn-outline"><History className="w-4 h-4" /> Save Version</button>
          <button onClick={() => setShowVersions(!showVersions)} className="btn-ghost text-sm">History ({versions.length})</button>
        </div>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-fg-soft">Workflow Progress</span><span className="text-sm text-fg-muted">{progress}% \u00b7 Stage {currentIdx + 1} of {WORKFLOW_STAGES.length}</span></div>
        <div className="h-2 bg-bg-soft rounded-full overflow-hidden mb-4"><div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        <div className="flex flex-wrap gap-1.5">
          {WORKFLOW_STAGES.map((stage, i) => {
            const done = i < currentIdx
            const current = i === currentIdx
            return (
              <button key={stage.id} onClick={() => setStage(stage.id)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${current ? 'bg-brand-600 text-white' : done ? 'bg-success-50 text-success-600' : 'bg-bg-soft text-fg-muted hover:text-fg'}`} title={stage.description}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : current ? <Clock className="w-3.5 h-3.5" /> : <Circle className="w-3 h-3" />}
                {stage.label}
              </button>
            )
          })}
        </div>
      </div>

      {showVersions && (
        <div className="card p-4 mb-6">
          <h3 className="font-semibold text-fg text-sm mb-3">Version History</h3>
          {versions.length === 0 ? <p className="text-sm text-fg-muted">No saved versions yet.</p> : (
            <div className="space-y-2">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between text-sm"><span className="text-fg-soft">{v.label ?? 'Autosave'}</span><span className="text-xs text-fg-muted">{new Date(v.created_at).toLocaleString()}</span></div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">{currentIdx + 1}</span>
          <h2 className="text-lg font-semibold text-fg">{WORKFLOW_STAGES[currentIdx].label}</h2>
        </div>
        <p className="text-sm text-fg-muted mb-5">{WORKFLOW_STAGES[currentIdx].description}</p>

        <StageContent
          stageId={project.current_stage} project={project} exportConfig={exportConfig} coverConfig={coverConfig}
          complianceIssues={complianceIssues} quality={quality} generatingMeta={generatingMeta}
          onRunCompliance={runCompliance} onRunQuality={runQuality} onGenerateMeta={generateMeta}
          onDownloadInterior={() => { downloadInteriorPDF(exportConfig); supabase.from('activity_log').insert({ user_id: user!.id, project_id: project.id, action: 'Exported interior PDF', detail: project.title }) }}
          onDownloadCover={() => { downloadCoverPDF(coverConfig); supabase.from('activity_log').insert({ user_id: user!.id, project_id: project.id, action: 'Exported cover PDF', detail: project.title }) }}
        />

        {currentIdx < WORKFLOW_STAGES.length - 1 && (
          <div className="mt-6 pt-4 border-t border-border-soft flex justify-end">
            <button onClick={() => setStage(WORKFLOW_STAGES[currentIdx + 1].id)} className="btn-primary">Next: {WORKFLOW_STAGES[currentIdx + 1].label} <ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  )
}

interface StageContentProps {
  stageId: string
  project: Project
  exportConfig: Record<string, unknown>
  coverConfig: Record<string, unknown>
  complianceIssues: { level: string; field: string; message: string; fix?: string }[]
  quality: { checks: { field: string; status: string; message: string }[]; score: number }
  generatingMeta: boolean
  onRunCompliance: () => void
  onRunQuality: () => void
  onGenerateMeta: () => void
  onDownloadInterior: () => void
  onDownloadCover: () => void
}

function StageContent({ stageId, project, complianceIssues, quality, generatingMeta, onRunCompliance, onRunQuality, onGenerateMeta, onDownloadInterior, onDownloadCover }: StageContentProps) {
  switch (stageId) {
    case 'market-research':
      return <div className="space-y-3"><p className="text-sm text-fg-soft">Research the Amazon marketplace for opportunities. Visit the Market Research tool for detailed analysis.</p><Link to="/market-research" className="btn-primary inline-flex">Open Market Research</Link>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          {[{label:'Bestselling books',desc:'Top performers in your category'},{label:'Trending books',desc:'Rising titles gaining momentum'},{label:'Seasonal trends',desc:'Time-sensitive opportunities'},{label:'Gap analysis',desc:'Underserved areas in the market'}].map((item) => (
            <div key={item.label} className="card p-4 bg-bg-soft"><div className="font-medium text-fg text-sm">{item.label}</div><div className="text-xs text-fg-muted mt-0.5">{item.desc}</div></div>
          ))}
        </div></div>
    case 'niche-selection':
      return <div className="space-y-3"><p className="text-sm text-fg-soft">Find profitable niches with manageable competition.</p><Link to="/niche-finder" className="btn-primary inline-flex">Open Niche Finder</Link></div>
    case 'competition-analysis':
      return <div className="space-y-3"><p className="text-sm text-fg-soft">Analyze competing books to understand positioning and pricing.</p><Link to="/market-research" className="btn-primary inline-flex">Analyze Competition</Link></div>
    case 'keyword-research':
      return <div className="space-y-3"><p className="text-sm text-fg-soft">Research primary, secondary, and long-tail keywords.</p><Link to="/keyword-research" className="btn-primary inline-flex">Open Keyword Research</Link></div>
    case 'book-planning':
      return <div className="space-y-3"><p className="text-sm text-fg-soft">Plan your book structure: trim size, page count, difficulty, and format.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="card p-3 bg-bg-soft"><div className="text-xs text-fg-muted">Trim Size</div><div className="text-sm font-medium text-fg">{project.config.trimSize ?? '8.5x11'}</div></div>
          <div className="card p-3 bg-bg-soft"><div className="text-xs text-fg-muted">Page Count</div><div className="text-sm font-medium text-fg">{project.config.pageCount ?? 60}</div></div>
          <div className="card p-3 bg-bg-soft"><div className="text-xs text-fg-muted">Difficulty</div><div className="text-sm font-medium text-fg capitalize">{project.config.difficulty ?? 'easy'}</div></div>
        </div></div>
    case 'interior-creation':
      return <div className="space-y-3"><p className="text-sm text-fg-soft">Generate and preview your book interior. Use the Puzzle or Coloring Generator for full control.</p>
        <Link to="/puzzle-generator" className="btn-primary inline-flex">Open Puzzle Generator</Link>
        <div className="flex gap-2"><button onClick={onDownloadInterior} className="btn-outline"><Download className="w-4 h-4" /> Preview Interior PDF</button></div></div>
    case 'cover-creation':
      return <div className="space-y-3"><p className="text-sm text-fg-soft">Design your cover. The Cover Creator handles front, spine, and back with KDP-compliant dimensions.</p>
        <Link to="/cover-creator" className="btn-primary inline-flex">Open Cover Creator</Link>
        <button onClick={onDownloadCover} className="btn-outline"><Download className="w-4 h-4" /> Preview Cover PDF</button></div>
    case 'metadata-creation':
      return <div className="space-y-3"><p className="text-sm text-fg-soft">Generate optimized metadata with AI \u2014 title, description, keywords, and categories.</p>
        <button onClick={onGenerateMeta} disabled={generatingMeta} className="btn-primary"><Sparkles className="w-4 h-4" /> {generatingMeta ? 'Generating...' : 'Generate AI Metadata'}</button>
        {project.metadata?.title && (
          <div className="mt-4 space-y-2 text-sm">
            <div><span className="text-fg-muted">Title:</span> <span className="text-fg">{project.metadata.title}</span></div>
            {project.metadata.subtitle && <div><span className="text-fg-muted">Subtitle:</span> <span className="text-fg">{project.metadata.subtitle}</span></div>}
            {project.metadata.keywords && <div><span className="text-fg-muted">Keywords:</span> <span className="text-fg">{project.metadata.keywords.join(', ')}</span></div>}
          </div>
        )}</div>
    case 'quality-validation':
      return <div className="space-y-4"><p className="text-sm text-fg-soft">Run automated quality checks across your book content.</p>
        <button onClick={onRunQuality} className="btn-primary"><Gauge className="w-4 h-4" /> Run Quality Checks</button>
        {project.quality_score != null && (
          <div>
            <div className="flex items-center gap-2 mb-3"><div className={`text-3xl font-bold ${project.quality_score >= 80 ? 'text-success-600' : project.quality_score >= 60 ? 'text-warning-600' : 'text-danger-600'}`}>{project.quality_score}</div><div className="text-sm text-fg-muted">/ 100 quality score</div></div>
            <div className="space-y-1.5">
              {quality.checks.map((c: any) => (
                <div key={c.field} className="flex items-center gap-2 text-sm">
                  {c.status === 'pass' ? <CheckCircle2 className="w-4 h-4 text-success-500" /> : c.status === 'warning' ? <Clock className="w-4 h-4 text-warning-500" /> : <Circle className="w-4 h-4 text-danger-500" />}
                  <span className="text-fg-soft">{c.field}:</span><span className="text-fg-muted">{c.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}</div>
    case 'compliance-validation':
      return <div className="space-y-4"><p className="text-sm text-fg-soft">Validate your book against Amazon KDP requirements.</p>
        <button onClick={onRunCompliance} className="btn-primary"><ShieldCheck className="w-4 h-4" /> Run Compliance Check</button>
        <div className="space-y-2">
          {complianceIssues.map((issue: any, i: number) => (
            <div key={i} className={`p-3 rounded-lg text-sm flex items-start gap-2 ${issue.level === 'error' ? 'bg-danger-50 text-danger-600' : issue.level === 'warning' ? 'bg-warning-50 text-warning-600' : 'bg-success-50 text-success-600'}`}>
              {issue.level === 'pass' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <Clock className="w-4 h-4 mt-0.5 shrink-0" />}
              <div><div className="font-medium">{issue.field}</div><div className="opacity-90">{issue.message}</div>{issue.fix && <div className="text-xs mt-0.5 opacity-75">Fix: {issue.fix}</div>}</div>
            </div>
          ))}
        </div></div>
    case 'export':
      return <div className="space-y-3"><p className="text-sm text-fg-soft">Export your complete KDP publishing package.</p>
        <div className="flex flex-wrap gap-2"><button onClick={onDownloadInterior} className="btn-primary"><Download className="w-4 h-4" /> Interior PDF</button><button onClick={onDownloadCover} className="btn-outline"><Download className="w-4 h-4" /> Cover PDF</button></div></div>
    case 'ready-for-kdp':
      return <div className="text-center py-6"><div className="w-16 h-16 rounded-full bg-success-50 text-success-600 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8" /></div>
        <h3 className="text-lg font-semibold text-fg">Ready for KDP!</h3>
        <p className="text-sm text-fg-muted mt-1 max-w-md mx-auto">Your book has passed all quality and compliance checks. Upload the exported PDFs to your Amazon KDP account to publish.</p></div>
    default:
      return <p className="text-sm text-fg-muted">Use the research tools to work through this stage.</p>
  }
}
