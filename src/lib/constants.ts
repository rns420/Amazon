export const KDP_TRIM_SIZES: { id: string; label: string; w: number; h: number; bleed: boolean; minPages: number; maxPages: number }[] = [
  { id: '5x8', label: '5" x 8"', w: 5, h: 8, bleed: false, minPages: 24, maxPages: 828 },
  { id: '5.06x7.81', label: '5.06" x 7.81"', w: 5.06, h: 7.81, bleed: false, minPages: 24, maxPages: 776 },
  { id: '5.25x8', label: '5.25" x 8"', w: 5.25, h: 8, bleed: false, minPages: 24, maxPages: 828 },
  { id: '5.5x8.5', label: '5.5" x 8.5"', w: 5.5, h: 8.5, bleed: false, minPages: 24, maxPages: 840 },
  { id: '6x9', label: '6" x 9"', w: 6, h: 9, bleed: false, minPages: 24, maxPages: 776 },
  { id: '6.14x9.21', label: '6.14" x 9.21"', w: 6.14, h: 9.21, bleed: false, minPages: 24, maxPages: 776 },
  { id: '6.69x9.61', label: '6.69" x 9.61"', w: 6.69, h: 9.61, bleed: false, minPages: 24, maxPages: 776 },
  { id: '7x10', label: '7" x 10"', w: 7, h: 10, bleed: false, minPages: 24, maxPages: 776 },
  { id: '7.44x9.69', label: '7.44" x 9.69"', w: 7.44, h: 9.69, bleed: false, minPages: 24, maxPages: 776 },
  { id: '7.5x9.25', label: '7.5" x 9.25"', w: 7.5, h: 9.25, bleed: false, minPages: 24, maxPages: 776 },
  { id: '8x10', label: '8" x 10"', w: 8, h: 10, bleed: true, minPages: 24, maxPages: 776 },
  { id: '8.25x6', label: '8.25" x 6"', w: 8.25, h: 6, bleed: false, minPages: 24, maxPages: 776 },
  { id: '8.25x8.25', label: '8.25" x 8.25"', w: 8.25, h: 8.25, bleed: true, minPages: 24, maxPages: 776 },
  { id: '8.5x8.5', label: '8.5" x 8.5"', w: 8.5, h: 8.5, bleed: true, minPages: 24, maxPages: 776 },
  { id: '8.5x11', label: '8.5" x 11"', w: 8.5, h: 11, bleed: true, minPages: 24, maxPages: 776 },
  { id: '8.27x11.69', label: '8.27" x 11.69" (A4)', w: 8.27, h: 11.69, bleed: true, minPages: 24, maxPages: 776 },
]

export const PAPERBACK_BLEED = 0.125

export const KDP_MIN_PAGES = 24
export const KDP_MAX_PAGES = 828

export const KDP_INTERIOR_MARGINS = {
  noBleed: { outer: 0.375, gutter: 0.125 },
  withBleed: { outer: 0.375, gutter: 0.125 },
  largePrint: { outer: 0.5, gutter: 0.25 },
}

export const KDP_SPINE_FORMULA = {
  whitePaper: 0.002252,
  creamPaper: 0.0025,
  minSpineForText: 79,
  minSpineWidth: 0.0625,
}

export const KDP_COVER_BARCODE_AREA = { w: 2, h: 1.2, margin: 0.25 }

export const KDP_METADATA_LIMITS = {
  titleMax: 200,
  subtitleMax: 200,
  authorMax: 50,
  descriptionMax: 4000,
  keywordsMax: 50,
  maxKeywords: 7,
}

export const KDP_CATEGORIES = [
  'Humor & Entertainment \u203a Puzzles & Games',
  "Children's Books \u203a Activities, Crafts & Games",
  'Crafts, Hobbies & Home \u203a Crafts & Hobbies',
  'Arts & Photography \u203a Drawing',
  'Self-Help \u203a Stress Management',
  'Education & Teaching \u203a Studying & Workbooks',
]

export const KDP_MARKETPLACES = [
  { code: 'US', label: 'Amazon.com (US)', domain: 'amazon.com' },
  { code: 'UK', label: 'Amazon.co.uk (UK)', domain: 'amazon.co.uk' },
  { code: 'DE', label: 'Amazon.de (Germany)', domain: 'amazon.de' },
  { code: 'FR', label: 'Amazon.fr (France)', domain: 'amazon.fr' },
  { code: 'ES', label: 'Amazon.es (Spain)', domain: 'amazon.es' },
  { code: 'IT', label: 'Amazon.it (Italy)', domain: 'amazon.it' },
  { code: 'NL', label: 'Amazon.nl (Netherlands)', domain: 'amazon.nl' },
  { code: 'JP', label: 'Amazon.co.jp (Japan)', domain: 'amazon.co.jp' },
  { code: 'CA', label: 'Amazon.ca (Canada)', domain: 'amazon.ca' },
  { code: 'AU', label: 'Amazon.com.au (Australia)', domain: 'amazon.com.au' },
]

export interface WorkflowStage { id: string; label: string; description: string }

export const WORKFLOW_STAGES: WorkflowStage[] = [
  { id: 'market-research', label: 'Market Research', description: 'Research the Amazon marketplace for opportunities using AI-powered analysis.' },
  { id: 'niche-selection', label: 'Niche Selection', description: 'Choose a profitable niche with manageable competition.' },
  { id: 'competition-analysis', label: 'Competition Analysis', description: 'Analyze competing books and their positioning.' },
  { id: 'keyword-research', label: 'Keyword Research', description: 'Find primary, secondary, and long-tail keywords.' },
  { id: 'book-planning', label: 'Book Planning', description: 'Plan book structure, page count, and format.' },
  { id: 'interior-creation', label: 'Interior Creation', description: 'Generate the book interior content.' },
  { id: 'cover-creation', label: 'Cover Creation', description: 'Design the front, spine, and back cover.' },
  { id: 'metadata-creation', label: 'Metadata Creation', description: 'Write optimized title, description, and keywords.' },
  { id: 'quality-validation', label: 'Quality Validation', description: 'Automated quality checks on content and layout.' },
  { id: 'compliance-validation', label: 'Compliance Validation', description: 'Verify KDP requirements are met.' },
  { id: 'export', label: 'Export', description: 'Generate KDP-ready PDF package.' },
  { id: 'ready-for-kdp', label: 'Ready for KDP', description: 'Book is ready to publish on Amazon KDP.' },
]

export const STAGE_IDS = WORKFLOW_STAGES.map((s) => s.id)

export const PUZZLE_TYPES = [
  { id: 'wordsearch', label: 'Word Search' },
  { id: 'sudoku', label: 'Sudoku' },
  { id: 'crossword', label: 'Crossword' },
  { id: 'mazes', label: 'Mazes' },
  { id: 'numbersearch', label: 'Number Search' },
  { id: 'wordscramble', label: 'Word Scramble' },
  { id: 'cryptograms', label: 'Cryptograms' },
  { id: 'logicpuzzles', label: 'Logic Puzzles' },
  { id: 'mixed', label: 'Mixed Activity Book' },
]

export const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
]

export const COLORING_THEMES = [
  { id: 'animals', label: 'Animals' },
  { id: 'mandala', label: 'Mandalas' },
  { id: 'flowers', label: 'Flowers' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'cute', label: 'Cute' },
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'educational', label: 'Educational' },
]

export const BOOK_TYPES = [
  { id: 'puzzle', label: 'Puzzle Book' },
  { id: 'coloring', label: 'Coloring Book' },
]

export function trimById(id: string) {
  return KDP_TRIM_SIZES.find((t) => t.id === id) ?? KDP_TRIM_SIZES[4]
}

export function stageIndex(id: string) {
  return STAGE_IDS.indexOf(id)
}

export function calculateSpineWidth(pageCount: number, paperType: 'white' | 'cream' = 'cream'): number {
  const multiplier = paperType === 'white' ? KDP_SPINE_FORMULA.whitePaper : KDP_SPINE_FORMULA.creamPaper
  return Math.max(KDP_SPINE_FORMULA.minSpineWidth, pageCount * multiplier)
}

export function canHaveSpineText(pageCount: number): boolean {
  return pageCount >= KDP_SPINE_FORMULA.minSpineForText
}
