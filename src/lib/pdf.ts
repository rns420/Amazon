import { jsPDF } from 'jspdf'
import { generateWordSearch, generateSudoku, generateMaze, WordSearchPuzzle, SudokuPuzzle, MazePuzzle } from './puzzles'
import { trimById, PAPERBACK_BLEED, KDP_INTERIOR_MARGINS, calculateSpineWidth, canHaveSpineText, KDP_COVER_BARCODE_AREA } from './constants'

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

export interface CoverExportConfig {
  trimSize: string
  title: string
  author: string
  subtitle: string
  primaryColor: string
  pageCount: number
  theme: string
}

function getMargins(largePrint: boolean) {
  return largePrint ? KDP_INTERIOR_MARGINS.largePrint : KDP_INTERIOR_MARGINS.noBleed
}

function pageDims(trimId: string, bleed: boolean) {
  const t = trimById(trimId)
  const bleedAdd = bleed ? PAPERBACK_BLEED : 0
  return { w: t.w + bleedAdd * 2, h: t.h + bleedAdd * 2 }
}

function newDoc(trimId: string, bleed: boolean) {
  const { w, h } = pageDims(trimId, bleed)
  return new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'in', format: [w, h], compress: true })
}

function addTitlePage(doc: jsPDF, title: string, author: string) {
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.text(title || 'Untitled', pw / 2, ph / 2 - 0.5, { align: 'center', maxWidth: pw - 2 })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.text(author || '', pw / 2, ph / 2 + 0.5, { align: 'center' })
}

function addCopyrightPage(doc: jsPDF, title: string, author: string) {
  doc.addPage()
  const ph = doc.internal.pageSize.getHeight()
  const pw = doc.internal.pageSize.getWidth()
  const margin = 0.875
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const year = new Date().getFullYear()
  const lines = [
    `\u00A9 ${year} ${author || 'Unknown Author'}`,
    'All rights reserved.',
    '',
    `Title: ${title || 'Untitled'}`,
    `Author: ${author || 'Unknown Author'}`,
    '',
    'No part of this book may be reproduced, stored in a',
    'retrieval system, or transmitted in any form or by any',
    'means, electronic, mechanical, photocopying, recording,',
    'or otherwise, without the prior written permission of the',
    'publisher, except for brief quotations in critical reviews',
    'and certain other noncommercial uses permitted by copyright law.',
    '',
    'First Edition.',
    '',
    'Printed in the United States of America.',
    '',
    `ISBN: XXX-X-XXXXXX-XX-X`,
  ]
  doc.text(lines, margin, ph - 4)
}

function drawWordSearchPage(doc: jsPDF, puzzle: WordSearchPuzzle, pageNum: number, showSolution: boolean, largePrint: boolean) {
  doc.addPage()
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const margins = getMargins(largePrint)
  const size = puzzle.size
  const availW = pw - 2 * margins.outer - margins.gutter
  const availH = ph - 2 * margins.outer - 1.5
  const cell = Math.min(availW, availH) / size
  const startX = margins.outer + margins.gutter
  const startY = margins.outer + 0.8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(largePrint ? 16 : 14)
  doc.text(`Word Search #${pageNum}`, startX, margins.outer + 0.4)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(showSolution ? (largePrint ? 12 : 10) : (largePrint ? 14 : 12))
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
  doc.setFontSize(largePrint ? 12 : 11)
  const wordsPerRow = 3
  const wordStartY = startY + size * cell + 0.4
  puzzle.words.forEach((w, i) => {
    const col = i % wordsPerRow
    const row = Math.floor(i / wordsPerRow)
    doc.text(`${w.word}`, startX + col * (availW / wordsPerRow), wordStartY + row * 0.25)
  })

  doc.setFontSize(9)
  doc.text(String(pageNum + 2), pw - margins.outer, ph - 0.3, { align: 'right' })
}

function drawSudokuPage(doc: jsPDF, puzzle: SudokuPuzzle, pageNum: number, showSolution: boolean, largePrint: boolean) {
  doc.addPage()
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const margins = getMargins(largePrint)
  const size = puzzle.size
  const availW = pw - 2 * margins.outer - margins.gutter
  const availH = ph - 2 * margins.outer - 1.5
  const cell = Math.min(availW, availH) / size
  const startX = margins.outer + margins.gutter + (availW - cell * size) / 2
  const startY = margins.outer + 0.8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(largePrint ? 16 : 14)
  doc.text(`Sudoku #${pageNum}`, startX, margins.outer + 0.4)

  const grid = showSolution ? puzzle.solution : puzzle.puzzle
  doc.setFont('helvetica', showSolution ? 'normal' : 'bold')
  doc.setFontSize(largePrint ? 22 : 18)
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
  doc.text(String(pageNum + 2), pw - margins.outer, ph - 0.3, { align: 'right' })
}

function drawMazePage(doc: jsPDF, maze: MazePuzzle, pageNum: number, largePrint: boolean) {
  doc.addPage()
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const margins = getMargins(largePrint)
  const size = maze.size
  const availW = pw - 2 * margins.outer - margins.gutter
  const availH = ph - 2 * margins.outer - 1.5
  const cell = Math.min(availW, availH) / size
  const startX = margins.outer + margins.gutter
  const startY = margins.outer + 0.8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(largePrint ? 16 : 14)
  doc.text(`Maze #${pageNum}`, startX, margins.outer + 0.4)

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
  doc.text(String(pageNum + 2), pw - margins.outer, ph - 0.3, { align: 'right' })
}

function drawColoringPage(doc: jsPDF, pageNum: number, theme: string, largePrint: boolean, seed: number) {
  doc.addPage()
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const margins = getMargins(largePrint)
  const availW = pw - 2 * margins.outer
  const availH = ph - 2 * margins.outer

  const cx = margins.outer + availW / 2
  const cy = margins.outer + availH / 2

  doc.setLineWidth(0.02)
  doc.setDrawColor(30, 41, 59)

  if (theme === 'mandala') {
    for (let r = 1; r <= 8; r++) {
      const radius = (availW / 2) * (r / 8) * 0.85
      doc.circle(cx, cy, radius)
      const petals = 6 + r * 2
      for (let p = 0; p < petals; p++) {
        const angle = (p / petals) * Math.PI * 2 + (seed * 0.1)
        doc.line(cx, cy, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
      }
    }
  } else if (theme === 'flowers') {
    for (let i = 0; i < 6; i++) {
      const fx = margins.outer + 1 + (i % 3) * (availW / 3)
      const fy = margins.outer + 1 + Math.floor(i / 3) * (availH / 2)
      doc.line(fx, fy + 0.5, fx, fy + 1.5)
      for (let p = 0; p < 6; p++) {
        const a = (p / 6) * Math.PI * 2
        const x1 = fx + Math.cos(a) * 0.4
        const y1 = fy + Math.sin(a) * 0.4
        const x2 = fx + Math.cos(a) * 0.6
        const y2 = fy + Math.sin(a) * 0.6
        doc.line(fx, fy, x2, y2)
        doc.circle((x1 + x2) / 2, (y1 + y2) / 2, 0.15)
      }
      doc.circle(fx, fy, 0.15)
    }
  } else if (theme === 'animals') {
    const w = availW * 0.6
    const h = availH * 0.5
    const sx = cx - w / 2
    const sy = cy - h / 2
    doc.rect(sx, sy, w, h)
    doc.line(sx + w * 0.2, sy, sx + w * 0.3, sy - h * 0.15)
    doc.line(sx + w * 0.3, sy - h * 0.15, sx + w * 0.4, sy)
    doc.line(sx + w * 0.6, sy, sx + w * 0.7, sy - h * 0.15)
    doc.line(sx + w * 0.7, sy - h * 0.15, sx + w * 0.8, sy)
    doc.circle(sx + w * 0.3, sy + h * 0.35, 0.15)
    doc.circle(sx + w * 0.7, sy + h * 0.35, 0.15)
    doc.line(sx + w * 0.4, sy + h * 0.6, sx + w * 0.5, sy + h * 0.7)
    doc.line(sx + w * 0.5, sy + h * 0.7, sx + w * 0.6, sy + h * 0.6)
  } else {
    for (let r = 0.5; r <= Math.min(availW, availH) / 2; r += 0.5) {
      doc.circle(cx, cy, r)
    }
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      doc.line(cx, cy, cx + Math.cos(angle) * (availW / 2) * 0.9, cy + Math.sin(angle) * (availH / 2) * 0.9)
    }
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(String(pageNum + 2), pw - margins.outer, ph - 0.3, { align: 'right' })
}

export function generateInteriorPDF(config: PuzzleExportConfig): jsPDF {
  const trim = trimById(config.trimSize)
  const doc = newDoc(config.trimSize, trim.bleed)
  addTitlePage(doc, config.title, config.author)
  addCopyrightPage(doc, config.title, config.author)

  const puzzleCount = Math.max(1, Math.floor(config.pageCount / 2))
  const seed = Date.now()

  for (let i = 0; i < puzzleCount; i++) {
    if (config.puzzleType === 'wordsearch') {
      const words = config.wordList && config.wordList.length > 3
        ? config.wordList
        : ['PUZZLE', 'BOOK', 'WORD', 'SEARCH', 'FIND', 'HIDDEN', 'LETTER', 'GRID', 'SOLVE', 'FUN']
      const puzzle = generateWordSearch(words, config.largePrint ? 12 : 14)
      drawWordSearchPage(doc, puzzle, i + 1, false, config.largePrint)
    } else if (config.puzzleType === 'sudoku') {
      const size = (config.gridSize === 4 ? 4 : 9) as 4 | 9
      const puzzle = generateSudoku(size, config.difficulty)
      drawSudokuPage(doc, puzzle, i + 1, false, config.largePrint)
    } else if (config.puzzleType === 'mazes') {
      const maze = generateMaze(config.largePrint ? 11 : 15)
      drawMazePage(doc, maze, i + 1, config.largePrint)
    } else {
      const puzzle = generateWordSearch(['PUZZLE', 'BOOK', 'WORD', 'SEARCH', 'FIND', 'HIDDEN'], 14)
      drawWordSearchPage(doc, puzzle, i + 1, false, config.largePrint)
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
        : ['PUZZLE', 'BOOK', 'WORD', 'SEARCH', 'FIND', 'HIDDEN', 'LETTER', 'GRID', 'SOLVE', 'FUN']
      const puzzle = generateWordSearch(words, config.largePrint ? 12 : 14)
      drawWordSearchPage(doc, puzzle, i + 1, true, config.largePrint)
    } else if (config.puzzleType === 'sudoku') {
      const size = (config.gridSize === 4 ? 4 : 9) as 4 | 9
      const puzzle = generateSudoku(size, config.difficulty)
      drawSudokuPage(doc, puzzle, i + 1, true, config.largePrint)
    }
  }

  return doc
}

export function downloadInteriorPDF(config: PuzzleExportConfig) {
  const doc = generateInteriorPDF(config)
  const safe = (config.title || 'interior').replace(/[^a-z0-9]/gi, '_')
  doc.save(`${safe}_interior.pdf`)
}

export function generateCoverPDF(config: CoverExportConfig): jsPDF {
  const trim = trimById(config.trimSize)
  const spineWidth = calculateSpineWidth(config.pageCount)
  const bleed = PAPERBACK_BLEED
  const w = trim.w * 2 + spineWidth + bleed * 4
  const h = trim.h + bleed * 2
  const doc = new jsPDF({ orientation: 'landscape', unit: 'in', format: [w, h], compress: true })

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

  if (canHaveSpineText(config.pageCount)) {
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(Math.min(10, spineWidth * 16))
    const spineMid = spineX + spineWidth / 2
    doc.text(config.title || 'Untitled', spineMid, h / 2, { align: 'center', angle: 90 })
    doc.setFontSize(7)
    doc.text(config.author || '', spineMid, h / 2 + 3, { align: 'center', angle: 90 })
  }

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

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.01)
  doc.rect(backX + trim.w - KDP_COVER_BARCODE_AREA.w - KDP_COVER_BARCODE_AREA.margin, h - KDP_COVER_BARCODE_AREA.h - KDP_COVER_BARCODE_AREA.margin, KDP_COVER_BARCODE_AREA.w, KDP_COVER_BARCODE_AREA.h)
  doc.setFontSize(7)
  doc.text('Barcode', backX + trim.w - KDP_COVER_BARCODE_AREA.w / 2 - KDP_COVER_BARCODE_AREA.margin, h - KDP_COVER_BARCODE_AREA.h / 2 - KDP_COVER_BARCODE_AREA.margin, { align: 'center' })

  return doc
}

export function downloadCoverPDF(config: CoverExportConfig) {
  const doc = generateCoverPDF(config)
  const safe = (config.title || 'cover').replace(/[^a-z0-9]/gi, '_')
  doc.save(`${safe}_cover.pdf`)
}

export function generateColoringPDF(config: { theme: string; pageCount: number; trimSize: string; largePrint: boolean; singleSided: boolean; title: string; author: string }): jsPDF {
  const trim = trimById(config.trimSize)
  const doc = newDoc(config.trimSize, trim.bleed)
  addTitlePage(doc, config.title, config.author)
  addCopyrightPage(doc, config.title, config.author)

  const pageContent = config.singleSided ? config.pageCount : Math.floor(config.pageCount / 2)
  for (let i = 0; i < pageContent; i++) {
    drawColoringPage(doc, i + 1, config.theme, config.largePrint, i + Date.now())
    if (!config.singleSided && i < pageContent - 1) {
      doc.addPage()
    }
  }

  return doc
}

export function downloadColoringPDF(config: { theme: string; pageCount: number; trimSize: string; largePrint: boolean; singleSided: boolean; title: string; author: string }) {
  const doc = generateColoringPDF(config)
  const safe = (config.title || 'coloring').replace(/[^a-z0-9]/gi, '_')
  doc.save(`${safe}_interior.pdf`)
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '')
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  return [r, g, b]
}
