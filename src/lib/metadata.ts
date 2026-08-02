import { BookMetadata } from './types'

export function generateMetadata(opts: {
  topic: string
  bookType: string
  audience: string
  difficulty: string
}): BookMetadata {
  const { topic, bookType, audience, difficulty } = opts
  const topicTitle = topic.trim() || 'Activity'
  const typeLabel = bookType === 'coloring' ? 'Coloring Book' : 'Puzzle Book'
  const audLabel = audience === 'children' ? 'Kids' : audience === 'adult' ? 'Adults' : 'All Ages'

  const title = `${topicTitle} ${typeLabel} for ${audLabel}`
  const subtitle = `${difficulty === 'easy' ? 'Easy' : difficulty === 'hard' ? 'Challenging' : 'Medium'} ${typeLabel} with Solutions`
  const short = `${topicTitle} ${typeLabel} — ${difficulty} puzzles with solutions.`
  const description = `Discover hours of fun with this ${difficulty} ${topicTitle.toLowerCase()} ${typeLabel.toLowerCase()} designed for ${audLabel.toLowerCase()}. ` +
    `Packed with engaging puzzles, this book offers a perfect blend of entertainment and brain training. ` +
    `Every puzzle includes a solution, making it ideal for both solo enjoyment and group activities. ` +
    `Large print format ensures comfortable solving. Perfect for gifts, travel, and daily relaxation. ` +
    `Features:\n\n• ${difficulty === 'easy' ? '100+' : '50+'} carefully crafted puzzles\n• Complete solutions included\n• Large, clear print\n• Single-sided pages\n• Premium matte finish cover\n\nOrder your copy today and start solving!`

  const keywords = [
    topic.toLowerCase(),
    `${topic.toLowerCase()} ${bookType === 'coloring' ? 'coloring book' : 'puzzle book'}`,
    `${audLabel.toLowerCase()} ${bookType === 'coloring' ? 'coloring' : 'activity book'}`,
    `${difficulty} puzzles`,
    'large print puzzles',
    'puzzle book for adults',
    'puzzle book for kids',
    'brain games',
    'activity book',
    'gift book',
    'travel puzzles',
    'solutions included',
  ]

  const categories = bookType === 'coloring'
    ? ['Crafts, Hobbies & Home › Crafts & Hobbies › Coloring Books for Grown-Ups', 'Children\'s Books › Activities, Crafts & Games › Activity Books']
    : ['Humor & Entertainment › Puzzles & Games › Sudoku', 'Humor & Entertainment › Puzzles & Games › Word Games']

  const bisac = bookType === 'coloring'
    ? ['GAM007000', 'CRA026000']
    : ['GAM005000', 'GAM006000']

  return {
    title,
    subtitle,
    description,
    short_description: short,
    author: '',
    series: '',
    edition: '1st',
    language: 'English',
    reading_age: audience === 'children' ? '8-12 years' : 'All ages',
    audience: audience === 'children' ? 'Children' : audience === 'adult' ? 'Adult' : 'General',
    keywords,
    categories,
    bisac,
  }
}
