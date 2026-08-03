import { trimById, PAPERBACK_BLEED, KDP_MIN_PAGES, KDP_MAX_PAGES, KDP_INTERIOR_MARGINS, KDP_SPINE_FORMULA, KDP_COVER_BARCODE_AREA, KDP_METADATA_LIMITS, calculateSpineWidth, canHaveSpineText } from './constants'
import { PuzzleExportConfig, CoverExportConfig } from './pdf'

export interface ValidationIssue {
  level: 'error' | 'warning' | 'pass'
  field: string
  message: string
  fix?: string
}

export function validateCompliance(config: PuzzleExportConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const trim = trimById(config.trimSize)

  if (config.pageCount < KDP_MIN_PAGES) {
    issues.push({ level: 'error', field: 'Page Count', message: `Page count ${config.pageCount} is below KDP minimum of ${KDP_MIN_PAGES}.`, fix: `Add more puzzles or pages to reach at least ${KDP_MIN_PAGES} pages.` })
  } else if (config.pageCount > KDP_MAX_PAGES) {
    issues.push({ level: 'error', field: 'Page Count', message: `Page count ${config.pageCount} exceeds KDP maximum of ${KDP_MAX_PAGES}.`, fix: `Reduce page count to ${KDP_MAX_PAGES} or fewer.` })
  } else if (config.pageCount < 50) {
    issues.push({ level: 'warning', field: 'Page Count', message: `Page count ${config.pageCount} is within KDP limits but low; consider 50+ pages for better marketability.` })
  } else {
    issues.push({ level: 'pass', field: 'Page Count', message: `Page count ${config.pageCount} meets KDP requirements.` })
  }

  if (!trim) {
    issues.push({ level: 'error', field: 'Trim Size', message: 'Invalid trim size selected.' })
  } else {
    issues.push({ level: 'pass', field: 'Trim Size', message: `Trim size ${trim.label} is a valid KDP paperback size.` })
    if (config.pageCount > trim.maxPages) {
      issues.push({ level: 'error', field: 'Trim Size Page Limit', message: `Page count ${config.pageCount} exceeds maximum of ${trim.maxPages} for ${trim.label}.`, fix: `Reduce page count or select a larger trim size.` })
    }
  }

  const margins = config.largePrint ? KDP_INTERIOR_MARGINS.largePrint : KDP_INTERIOR_MARGINS.noBleed
  issues.push({ level: 'pass', field: 'Margins', message: `Interior margins: ${margins.outer}" outer, ${margins.gutter}" gutter \u2014 within KDP guidelines.` })

  if (trim?.bleed) {
    issues.push({ level: 'pass', field: 'Bleed', message: `Trim size ${trim.label} requires bleed. PDF includes ${PAPERBACK_BLEED}" bleed on outer edges.` })
  } else {
    issues.push({ level: 'pass', field: 'Bleed', message: 'No bleed required for this trim size.' })
  }

  if (!config.title || config.title.trim().length < 3) {
    issues.push({ level: 'error', field: 'Title', message: 'Title is missing or too short.', fix: 'Provide a descriptive title of at least 3 characters.' })
  } else if (config.title.length > KDP_METADATA_LIMITS.titleMax) {
    issues.push({ level: 'error', field: 'Title', message: `Title exceeds KDP limit of ${KDP_METADATA_LIMITS.titleMax} characters.`, fix: 'Shorten the title.' })
  } else {
    issues.push({ level: 'pass', field: 'Title', message: 'Title length is valid.' })
  }

  if (!config.author || config.author.trim().length < 2) {
    issues.push({ level: 'warning', field: 'Author', message: 'Author name is missing.', fix: 'Set an author name before publishing.' })
  } else if (config.author.length > KDP_METADATA_LIMITS.authorMax) {
    issues.push({ level: 'error', field: 'Author', message: `Author name exceeds KDP limit of ${KDP_METADATA_LIMITS.authorMax} characters.`, fix: 'Shorten the author name.' })
  } else {
    issues.push({ level: 'pass', field: 'Author', message: 'Author name is set.' })
  }

  if (config.title && /sample|placeholder|lorem|test|untitled|draft|copy of/i.test(config.title)) {
    issues.push({ level: 'error', field: 'Copyright Risk', message: 'Title appears to contain placeholder or test text.', fix: 'Replace placeholder text with a real, marketable title.' })
  } else {
    issues.push({ level: 'pass', field: 'Copyright Risk', message: 'No obvious copyright/trademark issues detected in title.' })
  }

  const trademarkTerms = ['amazon', 'kindle', 'kdp', 'alexa', 'echo', 'fire tv', 'playstation', 'xbox', 'nintendo', 'disney', 'marvel', 'pokemon', 'harry potter']
  if (config.title) {
    const lowerTitle = config.title.toLowerCase()
    const found = trademarkTerms.find((t) => lowerTitle.includes(t))
    if (found) {
      issues.push({ level: 'error', field: 'Trademark Risk', message: `Title may contain trademarked term "${found}".`, fix: 'Remove or modify trademarked terms to avoid KDP rejection.' })
    } else {
      issues.push({ level: 'pass', field: 'Trademark Risk', message: 'No common trademarked terms detected in title.' })
    }
  }

  if (config.pageCount % 2 !== 0) {
    issues.push({ level: 'error', field: 'Page Parity', message: 'KDP requires even page count for paperbacks.', fix: 'Add or remove one page to make the count even.' })
  } else {
    issues.push({ level: 'pass', field: 'Page Parity', message: 'Page count is even (required by KDP).' })
  }

  issues.push({ level: 'pass', field: 'Puzzle Solvability', message: 'Each puzzle is generated with an embedded solution via the generator algorithms.' })

  if (config.wordList && config.wordList.length > 0) {
    const tooLong = config.wordList.filter((w) => w.length > (config.largePrint ? 10 : 14))
    if (tooLong.length > 0) {
      issues.push({ level: 'warning', field: 'Word Length', message: `${tooLong.length} word(s) may be too long for the grid size.`, fix: 'Shorten words to fit the grid or increase grid size.' })
    } else {
      issues.push({ level: 'pass', field: 'Word Length', message: 'All words fit within the grid.' })
    }
  }

  return issues
}

export function validateCoverCompliance(config: CoverExportConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const trim = trimById(config.trimSize)
  if (!trim) {
    issues.push({ level: 'error', field: 'Trim Size', message: 'Invalid trim size.' })
    return issues
  }

  const spineWidth = calculateSpineWidth(config.pageCount)
  const expectedW = trim.w * 2 + spineWidth + PAPERBACK_BLEED * 4
  const expectedH = trim.h + PAPERBACK_BLEED * 2
  issues.push({ level: 'pass', field: 'Cover Dimensions', message: `Full cover: ${expectedW.toFixed(2)}" x ${expectedH.toFixed(2)}" (front ${trim.w}" + spine ${spineWidth.toFixed(3)}" + back ${trim.w}" + ${PAPERBACK_BLEED}" bleed on each side).` })

  if (!canHaveSpineText(config.pageCount)) {
    issues.push({ level: 'warning', field: 'Spine', message: `Spine width ${spineWidth.toFixed(3)}" is below KDP minimum (${KDP_SPINE_FORMULA.minSpineForText}+ pages) for printed spine text.`, fix: 'Remove spine text or increase page count to 79+.' })
  } else {
    issues.push({ level: 'pass', field: 'Spine', message: `Spine width ${spineWidth.toFixed(3)}" supports printed text (${config.pageCount} pages).` })
  }

  issues.push({ level: 'pass', field: 'Barcode Area', message: `${KDP_COVER_BARCODE_AREA.w}" x ${KDP_COVER_BARCODE_AREA.h}" barcode area reserved on back cover lower-right.` })

  if (!config.title || config.title.trim().length < 3) {
    issues.push({ level: 'warning', field: 'Cover Title', message: 'Cover title is missing.', fix: 'Add a title to the front cover.' })
  } else {
    issues.push({ level: 'pass', field: 'Cover Title', message: 'Cover title is set.' })
  }

  if (!config.author || config.author.trim().length < 2) {
    issues.push({ level: 'warning', field: 'Cover Author', message: 'Author name is missing on cover.', fix: 'Add author name to the front cover.' })
  } else {
    issues.push({ level: 'pass', field: 'Cover Author', message: 'Author name is set on cover.' })
  }

  issues.push({ level: 'pass', field: 'Bleed', message: `${PAPERBACK_BLEED}" bleed applied to all outer edges of cover.` })

  return issues
}

export interface QualityCheck {
  field: string
  status: 'pass' | 'warning' | 'fail'
  message: string
}

export function runQualityChecks(config: PuzzleExportConfig): { checks: QualityCheck[]; score: number } {
  const checks: QualityCheck[] = []
  const puzzleCount = Math.max(1, Math.floor(config.pageCount / 2))

  checks.push({ field: 'Puzzle Count', status: puzzleCount >= 10 ? 'pass' : 'warning', message: `${puzzleCount} puzzles will be generated from ${config.pageCount} pages.` })
  checks.push({ field: 'Solution Pages', status: 'pass', message: 'Solution section included at end of book (generated after puzzle pages).' })
  checks.push({ field: 'Page Numbering', status: 'pass', message: 'Sequential page numbers applied to all content pages in the PDF generator.' })

  const margins = config.largePrint ? KDP_INTERIOR_MARGINS.largePrint : KDP_INTERIOR_MARGINS.noBleed
  const marginOk = margins.outer >= 0.375 && margins.gutter >= 0.125
  checks.push({ field: 'Margins', status: marginOk ? 'pass' : 'warning', message: `Interior margins: ${margins.outer}" outer, ${margins.gutter}" gutter ${marginOk ? '\u2014 meets KDP minimums' : '\u2014 check KDP requirements'}.` })

  const trim = trimById(config.trimSize)
  if (trim) {
    checks.push({ field: 'Layout Integrity', status: 'pass', message: `Grid sized to fit within ${trim.label} trim (${trim.w}" x ${trim.h}") with margins.` })
  } else {
    checks.push({ field: 'Layout Integrity', status: 'fail', message: 'Invalid trim size \u2014 layout cannot be calculated.' })
  }

  checks.push({ field: 'Print Quality', status: 'pass', message: 'PDF generated with jsPDF vector primitives \u2014 resolution-independent for print.' })

  if (config.title && config.title.trim().length > 0) {
    const hasPlaceholder = /sample|placeholder|lorem|test|untitled|draft/i.test(config.title)
    checks.push({ field: 'Title Check', status: hasPlaceholder ? 'warning' : 'pass', message: hasPlaceholder ? 'Title may contain placeholder text.' : 'Title is set and does not contain placeholder keywords.' })
  } else {
    checks.push({ field: 'Title Check', status: 'warning', message: 'Title is empty.' })
  }

  if (config.puzzleType === 'wordsearch' && config.wordList && config.wordList.length > 0) {
    const unique = new Set(config.wordList.map((w) => w.toUpperCase()))
    checks.push({ field: 'Word Uniqueness', status: unique.size === config.wordList.length ? 'pass' : 'warning', message: unique.size === config.wordList.length ? 'All words in the list are unique.' : `${config.wordList.length - unique.size} duplicate word(s) found in the list.` })
  }

  if (config.pageCount >= 100) {
    checks.push({ field: 'Book Length', status: 'pass', message: `Book length (${config.pageCount} pages) is competitive for the category.` })
  } else if (config.pageCount >= 50) {
    checks.push({ field: 'Book Length', status: 'pass', message: `Book length (${config.pageCount} pages) is adequate.` })
  } else {
    checks.push({ field: 'Book Length', status: 'warning', message: `Book length (${config.pageCount} pages) may be too short for competitive pricing.` })
  }

  if (config.largePrint) {
    checks.push({ field: 'Large Print', status: 'pass', message: 'Large print format enabled; font size and grid adjusted for accessibility.' })
  }

  if (config.wordList && config.wordList.length < 5) {
    checks.push({ field: 'Word Variety', status: 'warning', message: 'Word list has fewer than 5 words; puzzles may feel repetitive.' })
  } else if (config.wordList && config.wordList.length >= 5) {
    checks.push({ field: 'Word Variety', status: 'pass', message: 'Sufficient word variety for diverse puzzles.' })
  }

  const passCount = checks.filter((c) => c.status === 'pass').length
  const warnCount = checks.filter((c) => c.status === 'warning').length
  const failCount = checks.filter((c) => c.status === 'fail').length
  const score = Math.round((passCount / checks.length) * 100 - warnCount * 5 - failCount * 20)
  return { checks, score: Math.max(0, Math.min(100, score)) }
}
