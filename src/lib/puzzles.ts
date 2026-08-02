import { DIFFICULTY_LEVELS } from './constants'

export interface WordSearchPuzzle {
  grid: string[][]
  words: { word: string; placed: boolean; cells: [number, number][] }[]
  size: number
}

const DIRS: [number, number][] = [
  [0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1],
]

export function generateWordSearch(words: string[], size = 14): WordSearchPuzzle {
  const cleaned = words.map((w) => w.toUpperCase().replace(/[^A-Z]/g, '')).filter((w) => w.length <= size)
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''))
  const placed: WordSearchPuzzle['words'] = []

  for (const word of cleaned) {
    let success = false
    for (let attempt = 0; attempt < 200 && !success; attempt++) {
      const dir = DIRS[Math.floor(Math.random() * DIRS.length)]
      const r = Math.floor(Math.random() * size)
      const c = Math.floor(Math.random() * size)
      const cells: [number, number][] = []
      let ok = true
      for (let i = 0; i < word.length; i++) {
        const nr = r + dir[0] * i
        const nc = c + dir[1] * i
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) { ok = false; break }
        if (grid[nr][nc] !== '' && grid[nr][nc] !== word[i]) { ok = false; break }
        cells.push([nr, nc])
      }
      if (ok) {
        for (let i = 0; i < word.length; i++) grid[cells[i][0]][cells[i][1]] = word[i]
        placed.push({ word, placed: true, cells })
        success = true
      }
    }
    if (!success) placed.push({ word, placed: false, cells: [] })
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    }
  }

  return { grid, words: placed, size }
}

export interface SudokuPuzzle {
  puzzle: number[][]
  solution: number[][]
  size: number
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function isValid(board: number[][], row: number, col: number, num: number, size: number): boolean {
  for (let i = 0; i < size; i++) {
    if (board[row][i] === num || board[i][col] === num) return false
  }
  const box = Math.sqrt(size)
  if (Number.isInteger(box)) {
    const br = Math.floor(row / box) * box
    const bc = Math.floor(col / box) * box
    for (let r = br; r < br + box; r++)
      for (let c = bc; c < bc + box; c++)
        if (board[r][c] === num) return false
  }
  return true
}

function solveSudoku(board: number[][], size: number): boolean {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) {
        for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].slice(0, size))) {
          if (isValid(board, r, c, num, size)) {
            board[r][c] = num
            if (solveSudoku(board, size)) return true
            board[r][c] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

export function generateSudoku(size: 4 | 9, difficulty: string): SudokuPuzzle {
  const board: number[][] = Array.from({ length: size }, () => Array(size).fill(0))
  solveSudoku(board, size)
  const solution = board.map((r) => [...r])
  const puzzle = board.map((r) => [...r])
  const total = size * size
  const removeRatio = difficulty === 'easy' ? 0.4 : difficulty === 'hard' ? 0.7 : 0.55
  const removeCount = Math.floor(total * removeRatio)
  const positions = shuffle(Array.from({ length: total }, (_, i) => i))
  for (let i = 0; i < removeCount; i++) {
    const r = Math.floor(positions[i] / size)
    const c = positions[i] % size
    puzzle[r][c] = 0
  }
  return { puzzle, solution, size }
}

export interface MazePuzzle {
  grid: number[][]
  start: [number, number]
  end: [number, number]
  size: number
}

export function generateMaze(size = 15): MazePuzzle {
  // simple grid maze: 1 = wall, 0 = path
  const grid: number[][] = Array.from({ length: size }, () => Array(size).fill(1))
  // recursive backtracker on odd cells
  const stack: [number, number][] = []
  const start: [number, number] = [1, 1]
  grid[1][1] = 0
  stack.push(start)
  while (stack.length) {
    const [r, c] = stack[stack.length - 1]
    const neighbors: [number, number][] = []
    for (const [dr, dc] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) {
      const nr = r + dr, nc = c + dc
      if (nr > 0 && nr < size - 1 && nc > 0 && nc < size - 1 && grid[nr][nc] === 1) {
        neighbors.push([nr, nc])
      }
    }
    if (neighbors.length) {
      const [nr, nc] = neighbors[Math.floor(Math.random() * neighbors.length)]
      grid[(r + nr) / 2][(c + nc) / 2] = 0
      grid[nr][nc] = 0
      stack.push([nr, nc])
    } else {
      stack.pop()
    }
  }
  const end: [number, number] = [size - 2, size - 2]
  grid[end[0]][end[1]] = 0
  return { grid, start, end, size }
}

export function difficultyLabel(id: string) {
  return DIFFICULTY_LEVELS.find((d) => d.id === id)?.label ?? id
}
