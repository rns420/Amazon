import { useState, useMemo } from 'react'
import { useToast } from '../lib/toast'
import { generateWordSearch, generateSudoku, generateMaze } from '../lib/puzzles'
import { downloadInteriorPDF } from '../lib/pdf'
import { PUZZLE_TYPES, DIFFICULTY_LEVELS, KDP_TRIM_SIZES } from '../lib/constants'
import { PageHeader } from '../components/ui'
import { Download, RefreshCw, Eye, Grid3x3 } from 'lucide-react'

export default function PuzzleGenerator() {
  const { notify } = useToast()
  const [puzzleType, setPuzzleType] = useState('wordsearch')
  const [difficulty, setDifficulty] = useState('easy')
  const [pageCount, setPageCount] = useState(60)
  const [trimSize, setTrimSize] = useState('8.5x11')
  const [largePrint, setLargePrint] = useState(false)
  const [gridSize, setGridSize] = useState(9)
  const [wordListText, setWordListText] = useState('PUZZLE\nBOOK\nWORD\nSEARCH\nFIND\nHIDDEN\nLETTER\nGRID')
  const [seed, setSeed] = useState(0)

  const wordList = useMemo(() => wordListText.split('\n').map((w) => w.trim()).filter(Boolean), [wordListText])

  const preview = useMemo<any>(() => {
    if (puzzleType === 'wordsearch') return generateWordSearch(wordList.length > 2 ? wordList : ['PUZZLE', 'BOOK', 'WORD', 'SEARCH'], largePrint ? 12 : 14)
    if (puzzleType === 'sudoku') return generateSudoku(gridSize === 4 ? 4 : 9, difficulty)
    if (puzzleType === 'mazes') return generateMaze(largePrint ? 11 : 15)
    return generateWordSearch(['PUZZLE', 'BOOK', 'WORD', 'SEARCH'], 14)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleType, difficulty, largePrint, gridSize, seed])

  const handleExport = () => {
    downloadInteriorPDF({
      puzzleType,
      difficulty,
      pageCount,
      trimSize,
      largePrint,
      theme: 'general',
      title: 'Sample Puzzle Book',
      author: 'Author Name',
      gridSize,
      wordList,
    })
    notify('Interior PDF exported.', 'success')
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Puzzle Generator"
        subtitle="Create puzzle book interiors with live preview and PDF export"
        actions={<button onClick={handleExport} className="btn-primary"><Download className="w-4 h-4" /> Export PDF</button>}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Config */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5 space-y-4">
            <div>
              <label className="label">Puzzle Type</label>
              <select className="input" value={puzzleType} onChange={(e) => setPuzzleType(e.target.value)}>
                {PUZZLE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {DIFFICULTY_LEVELS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            {puzzleType === 'sudoku' && (
              <div>
                <label className="label">Grid Size</label>
                <select className="input" value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))}>
                  <option value={4}>4×4 (Kids)</option>
                  <option value={9}>9×9 (Standard)</option>
                </select>
              </div>
            )}
            <div>
              <label className="label">Page Count</label>
              <input type="number" min={24} max={500} className="input" value={pageCount} onChange={(e) => setPageCount(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Trim Size</label>
              <select className="input" value={trimSize} onChange={(e) => setTrimSize(e.target.value)}>
                {KDP_TRIM_SIZES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={largePrint} onChange={(e) => setLargePrint(e.target.checked)} className="rounded" />
              <span className="text-sm text-fg-soft">Large Print</span>
            </label>
            {puzzleType === 'wordsearch' && (
              <div>
                <label className="label">Word List (one per line)</label>
                <textarea className="input min-h-[120px] font-mono text-xs" value={wordListText} onChange={(e) => setWordListText(e.target.value)} />
              </div>
            )}
          </div>

          <div className="card p-4 flex items-center gap-2">
            <button onClick={() => setSeed((s) => s + 1)} className="btn-outline flex-1"><RefreshCw className="w-4 h-4" /> Regenerate</button>
            <span className="text-xs text-fg-muted flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Live preview</span>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Grid3x3 className="w-5 h-5 text-brand-600" />
              <h3 className="font-semibold text-fg">Preview</h3>
            </div>
            {puzzleType === 'wordsearch' && <WordSearchPreview puzzle={preview as ReturnType<typeof generateWordSearch>} />}
            {puzzleType === 'sudoku' && <SudokuPreview puzzle={preview as ReturnType<typeof generateSudoku>} />}
            {puzzleType === 'mazes' && <MazePreview maze={preview as ReturnType<typeof generateMaze>} />}
            {!['wordsearch', 'sudoku', 'mazes'].includes(puzzleType) && (
              <div className="text-center py-10 text-fg-muted text-sm">
                Live preview for "{PUZZLE_TYPES.find((t) => t.id === puzzleType)?.label}" is shown in the exported PDF.
                The generator supports this puzzle type in the full interior export.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function WordSearchPreview({ puzzle }: { puzzle: ReturnType<typeof generateWordSearch> }) {
  return (
    <div>
      <div className="inline-block">
        <table className="border-collapse">
          <tbody>
            {puzzle.grid.map((row, r) => (
              <tr key={r}>
                {row.map((ch, c) => {
                  const isWord = puzzle.words.some((w) => w.placed && w.cells.some(([wr, wc]) => wr === r && wc === c))
                  return (
                    <td key={c} className={`w-7 h-7 text-center font-mono text-sm border border-border-soft ${isWord ? 'bg-brand-50 text-brand-700 font-bold' : 'text-fg-soft'}`}>
                      {ch}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <div className="text-xs font-medium text-fg-muted mb-1.5">Words to find:</div>
        <div className="flex flex-wrap gap-2">
          {puzzle.words.map((w, i) => (
            <span key={i} className={`badge ${w.placed ? 'bg-bg-soft text-fg-soft' : 'bg-danger-50 text-danger-600'}`}>
              {w.word} {w.placed ? '' : '(not placed)'}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function SudokuPreview({ puzzle }: { puzzle: ReturnType<typeof generateSudoku> }) {
  const size = puzzle.size
  const box = Math.sqrt(size)
  return (
    <div className="inline-block">
      <table className="border-collapse">
        <tbody>
          {puzzle.puzzle.map((row, r) => (
            <tr key={r}>
              {row.map((n, c) => {
                const borderRight = Number.isInteger(box) && (c + 1) % box === 0 && c < size - 1
                const borderBottom = Number.isInteger(box) && (r + 1) % box === 0 && r < size - 1
                return (
                  <td key={c} className={`w-9 h-9 text-center font-mono text-base border border-border-soft ${n === 0 ? 'text-transparent' : 'text-fg font-medium'} ${borderRight ? 'border-r-2 border-r-brand-300' : ''} ${borderBottom ? 'border-b-2 border-b-brand-300' : ''}`}>
                    {n === 0 ? '' : n}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MazePreview({ maze }: { maze: ReturnType<typeof generateMaze> }) {
  return (
    <div className="inline-block">
      <table className="border-collapse">
        <tbody>
          {maze.grid.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => {
                const isStart = r === maze.start[0] && c === maze.start[1]
                const isEnd = r === maze.end[0] && c === maze.end[1]
                return (
                  <td key={c} className={`w-4 h-4 border-collapse ${cell === 1 ? 'bg-slate-700' : isStart ? 'bg-success-500' : isEnd ? 'bg-danger-500' : 'bg-white'}`} />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
