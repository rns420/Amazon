import { jsPDF } from 'jspdf'
import { generateWordSearch, generateSudoku, generateMaze, WordSearchPuzzle, SudokuPuzzle, MazePuzzle } from './puzzles'
import { trimById, PAPERBACK_BLEED } from './constants'

export interface PuzzleExportConfig {
  puzzleType: string
  difficulty: string
  pageCount: number
  trimSize: string
  largePrint: boolean
  theme: string
  title: string
  author: string
  gridSize?: number
  wordList?: string[]
}

const MARGIN = 0.5
const GUTTER = 0.3

function pageDims(trimId: string, bleed: boolean) {
  const t = trimById(trimId)
  const bleedAdd = bleed ? PAPERBACK_BLEED : 0
  return { w: t.w + bleedAdd * 2, h: t.h + bleedAdd * 2 }
}

function newDoc(trimId: string, bleed: boolean) {
  const { w, h } = pageDims(trimId, bleed)
  return new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'in', format: [w, h] })
}

function addTitlePage(doc: jsPDF, title: string, author: string) {
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.text(title || 'Untitled', pw / 2, ph / 2 - 0.5, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.text(author || '', pw / 2, ph / 2 + 0.5, { align: 'center' })
}

function addCopyrightPage(doc: jsPDF, title: string, author: string) {
  doc.addPage()
  const ph = doc.internal.pageSize.getHeight()
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const lines = [
    `\u00A9 ${new Date().getFullYear()} ${author || 'Unknown Author'}`,
    'All rights reserved.', '',
    `Title: ${title || 'Untitled'}`,
    'No part of this book may be reproduced or transmitted',
    'in any form or by any means without written permission.', '',
    'First Edition.', '',
    'Printed in the United States of America.',
  ]
  doc.text(lines, MARGIN, ph - 2)
}

function drawWordSearchPage(doc: jsPDF, puzzle: WordSearchPuzzle, pageNum: number, showSolution: boolean) {
  doc.addPage()
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const size = puzzle.size
  const availW = pw - 2 * MARGIN - GUTTER
  const availH = ph - 2 * MARGIN - 1.5
  const cell = Math.min(availW, availH) / size
  const startX = MARGIN + GUTTER
  const startY = MARGIN + 0.8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`Word Search #${pageNum}`, startX, MARGIN + 0.4)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(showSolution ? 10 : 12)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const x = startX + c * cell + cell / 2
      const y = startY + r * cell + cell / 2
      doc.text(puzzle.grid[r][c], x, y, { align: 'center', baseline: 'middle' })
    }
  }

  doc.setLineWidth(0.01)
  for (let i = 0; i <= size; i++) {
    doc.line(startX, startY + i * cell, startX + size * cell, startY + i * cell)
    doc.line(startX + i * cell, startY, startX + i * cell, startY + size * cell)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const wordsPerRow = 3
  const wordStartY = startY + size * cell + 0.4
  puzzle.words.forEach((w, i) => {
    const col = i % wordsPerRow
    const row = Math.floor(i / wordsPerRow)
    doc.text(`${w.word}`, startX + col * (availW / wordsPerRow), wordStartY + row * 0.25)
  })

  doc.setFontSize(9)
  doc.text(String(pageNum + 2), pw - MARGIN, ph - 0.3, { align: 'right' })
}

function drawSudokuPage(doc: jsPDF, puzzle: SudokuPuzzle, pageNum: number, showSolution: boolean) {
  doc.addPage()
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const size = puzzle.size
  const availW = pw - 2 * MARGIN - GUTTER
  const availH = ph - 2 * MARGIN - 1.5
  const cell = Math.min(availW, availH) / size
  const startX = MARGIN + GUTTER + (availW - cell * size) / 2
  const startY = MARGIN + 0.8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`Sudoku #${pageNum}`, startX, MARGIN + 0.4)

  const grid = showSolution ? puzzle.solution : puzzle.puzzle
  doc.setFont('helvetica', showSolution ? 'normal' : 'bold')
  doc.setFontSize(18)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== 0) {
        const x = startX + c * cell + cell / 2
        const y = startY + r * cell + cell / 2
        doc.text(String(grid[r][c]), x, y, { align: 'center', baseline: 'middle' })
      }
    }
  }

  doc.setLineWidth(0.01)
  for (let i = 0; i <= size; i++) {
    doc.line(startX, startY + i * cell, startX + size * cell, startY + i * cell)
    doc.line(startX + i * cell, startY, startX + i * cell, startY + size * cell)
  }
  const box = Math.sqrt(size)
  if (Number.isInteger(box)) {
    doc.setLineWidth(0.03)
    for (let i = 0; i <= size; i += box) {
      doc.line(startX, startY + i * cell, startX + size * cell, startY + i * cell)
      doc.line(startX + i * cell, startY, startX + i * cell, startY + size * cell)
    }
  }

  doc.setFontSize(9)
  doc.text(String(pageNum + 2), pw - MARGIN, ph - 0.3, { align: 'right' })
}

function drawMazePage(doc: jsPDF, maze: MazePuzzle, pageNum: number) {
  doc.addPage()
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const size = maze.size
  const availW = pw - 2 * MARGIN - GUTTER
  const availH = ph - 2 * MARGIN - 1.5
  const cell = Math.min(availW, availH) / size
  const startX = MARGIN + GUTTER
  const startY = MARGIN + 0.8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`Maze #${pageNum}`, startX, MARGIN + 0.4)

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (maze.grid[r][c] === 1) {
        doc.setFillColor(30, 41, 59)
        doc.rect(startX + c * cell, startY + r * cell, cell, cell, 'F')
      }
    }
  }
  doc.setFillColor(34, 197, 94)
  doc.rect(startX + maze.start[1] * cell, startY + maze.start[0] * cell, cell, cell, 'F')
  doc.setFillColor(239, 68, 68)
  doc.rect(startX + maze.end[1] * cell, startY + maze.end[0] * cell, cell, cell, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(String(pageNum + 2), pw - MARGIN, ph - 0.3, { align: 'right' })
}

export function generateInteriorPDF(config: PuzzleExportConfig): jsPDF {
  const doc = newDoc(config.trimSize, false)
  addTitlePage(doc, config.title, config.author)
  addCopyrightPage(doc, config.title, config.author)

  const puzzleCount = Math.max(1, Math.floor(config.pageCount / 2))

  for (let i = 0; i < puzzleCount; i++) {
    if (config.puzzleType === 'wordsearch') {
      const words = config.wordList && config.wordList.length > 3
        ? config.wordList
        : ['PUZZLE', 'BOOK', 'WORD', 'SEARCH', 'FIND', 'HIDDEN', 'LETTER', 'GRID']
      const puzzle = generateWordSearch(words, config.largePrint ? 12 : 14)
      drawWordSearchPage(doc, puzzle, i + 1, false)
    } else if (config.puzzleType === 'sudoku') {
      const size = (config.gridSize === 4 ? 4 : 9) as 4 | 9
      const puzzle = generateSudoku(size, config.difficulty)
      drawSudokuPage(doc, puzzle, i + 1, false)
    } else if (config.puzzleType === 'mazes') {
      const maze = generateMaze(config.largePrint ? 11 : 15)
      drawMazePage(doc, maze, i + 1)
    } else {
      const puzzle = generateWordSearch(['PUZZLE', 'BOOK', 'WORD', 'SEARCH', 'FIND', 'HIDDEN'], 14)
      drawWordSearchPage(doc, puzzle, i + 1, false)
    }
  }

  doc.addPage()
  const pw = doc.internal.pageSize.getWidth()
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Solutions', pw / 2, 2, { align: 'center' })

  for (let i = 0; i < puzzleCount; i++) {
    if (config.puzzleType === 'wordsearch') {
      const words = config.wordList && config.wordList.length > 3
        ? config.wordList
        : ['PUZZLE', 'BOOK', 'WORD', 'SEARCH', 'FIND', 'HIDDEN', 'LETTER', 'GRID']
      const puzzle = generateWordSearch(words, config.largePrint ? 12 : 14)
      drawWordSearchPage(doc, puzzle, i + 1, true)
    } else if (config.puzzleType === 'sudoku') {
      const size = (config.gridSize === 4 ? 4 : 9) as 4 | 9
      const puzzle = generateSudoku(size, config.difficulty)
      drawSudokuPage(doc, puzzle, i + 1, true)
    }
  }

  return doc
}

export function downloadInteriorPDF(config: PuzzleExportConfig) {
  const doc = generateInteriorPDF(config)
  const safe = (config.title || 'interior').replace(/[^a-z0-9]/gi, '_')
  doc.save(`${safe}_interior.pdf`)
}

export interface CoverExportConfig {
  trimSize: string
  title: string
  author: string
  subtitle: string
  primaryColor: string
  pageCount: number
  theme: string
}

export function generateCoverPDF(config: CoverExportConfig): jsPDF {
  const trim = trimById(config.trimSize)
  const spineWidth = Math.max(0.0625, config.pageCount * 0.002252)
  const bleed = PAPERBACK_BLEED
  const w = trim.w * 2 + spineWidth + bleed * 4
  const h = trim.h + bleed * 2
  const doc = new jsPDF({ orientation: 'landscape', unit: 'in', format: [w, h] })

  const backX = bleed
  const spineX = backX + trim.w
  const frontX = spineX + spineWidth

  doc.setFillColor(255, 255, 255)
  doc.rect(backX, 0, trim.w, h, 'F')
  const [r, g, b] = hexToRgb(config.primaryColor)
  doc.setFillColor(r, g, b)
  doc.rect(spineX, 0, spineWidth, h, 'F')
  doc.setFillColor(r, g, b)
  doc.rect(frontX, 0, trim.w, h, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const spineMid = spineX + spineWidth / 2
  doc.text(config.title || 'Untitled', spineMid, h / 2, { align: 'center', angle: 90 })
  doc.setFontSize(7)
  doc.text(config.author || '', spineMid, h / 2 + 3, { align: 'center', angle: 90 })

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(config.theme === 'bold' ? 28 : 22)
  const fcMid = frontX + trim.w / 2
  doc.text(config.title || 'Untitled', fcMid, h / 2 - 0.5, { align: 'center', maxWidth: trim.w - 1 })
  if (config.subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.text(config.subtitle, fcMid, h / 2 + 0.2, { align: 'center', maxWidth: trim.w - 1 })
  }
  doc.setFontSize(11)
  doc.text(config.author || '', fcMid, h - 1, { align: 'center' })

  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Back Cover', backX + trim.w / 2, h / 2, { align: 'center' })
  doc.setFontSize(7)
  doc.text('Barcode area', backX + 1, h - 1)

  return doc
}

export function downloadCoverPDF(config: CoverExportConfig) {
  const doc = generateCoverPDF(config)
  const safe = (config.title || 'cover').replace(/[^a-z0-9]/gi, '_')
  doc.save(`${safe}_cover.pdf`)
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '')
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  return [r, g, b]
}
