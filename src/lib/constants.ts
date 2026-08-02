export const KDP_TRIM_SIZES: { id: string; label: string; w: number; h: number; bleed: boolean }[] = [
  { id: '5x8', label: '5" x 8"', w: 5, h: 8, bleed: false },
  { id: '5.06x7.81', label: '5.06" x 7.81"', w: 5.06, h: 7.81, bleed: false },
  { id: '5.25x8', label: '5.25" x 8"', w: 5.25, h: 8, bleed: false },
  { id: '5.5x8.5', label: '5.5" x 8.5"', w: 5.5, h: 8.5, bleed: false },
  { id: '6x9', label: '6" x 9"', w: 6, h: 9, bleed: false },
  { id: '6.14x9.21', label: '6.14" x 9.21"', w: 6.14, h: 9.21, bleed: false },
  { id: '6.69x9.61', label: '6.69" x 9.61"', w: 6.69, h: 9.61, bleed: false },
  { id: '7x10', label: '7" x 10"', w: 7, h: 10, bleed: false },
  { id: '7.44x9.69', label: '7.44" x 9.69"', w: 7.44, h: 9.69, bleed: false },
  { id: '7.5x9.25', label: '7.5" x 9.25"', w: 7.5, h: 9.25, bleed: false },
  { id: '8x10', label: '8" x 10"', w: 8, h: 10, bleed: true },
  { id: '8.25x6', label: '8.25" x 6"', w: 8.25, h: 6, bleed: false },
  { id: '8.25x8.25', label: '8.25" x 8.25"', w: 8.25, h: 8.25, bleed: true },
  { id: '8.5x8.5', label: '8.5" x 8.5"', w: 8.5, h: 8.5, bleed: true },
  { id: '8.5x11', label: '8.5" x 11"', w: 8.5, h: 11, bleed: true },
  { id: '8.27x11.69', label: '8.27" x 11.69" (A4)', w: 8.27, h: 11.69, bleed: true },
]

export const PAPERBACK_BLEED = 0.125 // inches added to each outer edge

export interface WorkflowStage {
  id: string
  label: string
  description: string
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  { id: 'market-research', label: 'Market Research', description: 'Research the Amazon marketplace for opportunities.' },
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
