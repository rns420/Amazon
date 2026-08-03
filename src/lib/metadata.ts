import { BookMetadata } from './types'

interface AIGenerationResponse {
  title?: string
  subtitle?: string
  description?: string
  short_description?: string
  keywords?: string[]
  categories?: string[]
  bisac?: string[]
  reading_age?: string
}

export async function generateMetadataWithAI(opts: {
  topic: string
  bookType: string
  audience: string
  difficulty: string
  accessToken: string | null
}): Promise<BookMetadata> {
  const { topic, bookType, audience, difficulty, accessToken } = opts
  const prompt = `You are an expert Amazon KDP metadata copywriter. Create optimized KDP metadata for a ${difficulty} ${bookType === 'coloring' ? 'coloring book' : 'puzzle book'} about "${topic}" targeting ${audience} readers.

Return a JSON object with this exact structure:
{
  "title": "<optimized, marketable title under 200 chars>",
  "subtitle": "<engaging subtitle under 200 chars>",
  "short_description": "<1-2 sentence summary>",
  "description": "<full KDP description (up to 4000 chars) with bullet points, compelling and keyword-rich>",
  "keywords": ["<7-12 backend keyword phrases, each under 50 chars>"],
  "categories": ["<2 KDP browse categories>"],
  "bisac": ["<2 BISAC codes>"],
  "reading_age": "<reading age range>"
}

Return ONLY the JSON, no other text.`

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'keyword', query: topic, bookType, audience }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Metadata generation failed (${res.status})`)
  }
  const json = await res.json()
  const data = json.data as AIGenerationResponse
  return {
    title: data.title ?? '',
    subtitle: data.subtitle ?? '',
    description: data.description ?? '',
    short_description: data.short_description ?? '',
    author: '',
    series: '',
    edition: '1st',
    language: 'English',
    reading_age: data.reading_age ?? (audience === 'children' ? '8-12 years' : 'All ages'),
    audience: audience === 'children' ? 'Children' : audience === 'adult' ? 'Adult' : 'General',
    keywords: data.keywords ?? [],
    categories: data.categories ?? [],
    bisac: data.bisac ?? [],
  }
}

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
  const short = `${topicTitle} ${typeLabel} \u2014 ${difficulty} puzzles with solutions.`
  const description = `Discover hours of fun with this ${difficulty} ${topicTitle.toLowerCase()} ${typeLabel.toLowerCase()} designed for ${audLabel.toLowerCase()}. ` +
    `Packed with engaging puzzles, this book offers a perfect blend of entertainment and brain training. ` +
    `Every puzzle includes a solution, making it ideal for both solo enjoyment and group activities. ` +
    `Large print format ensures comfortable solving. Perfect for gifts, travel, and daily relaxation. ` +
    `Features:\n\n\u2022 ${difficulty === 'easy' ? '100+' : '50+'} carefully crafted puzzles\n\u2022 Complete solutions included\n\u2022 Large, clear print\n\u2022 Single-sided pages\n\u2022 Premium matte finish cover\n\nOrder your copy today and start solving!`

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
    ? ['Crafts, Hobbies & Home \u203a Crafts & Hobbies \u203a Coloring Books for Grown-Ups', "Children's Books \u203a Activities, Crafts & Games \u203a Activity Books"]
    : ['Humor & Entertainment \u203a Puzzles & Games \u203a Sudoku', 'Humor & Entertainment \u203a Puzzles & Games \u203a Word Games']

  const bisac = bookType === 'coloring' ? ['GAM007000', 'CRA026000'] : ['GAM005000', 'GAM006000']

  return {
    title, subtitle, description, short_description: short,
    author: '', series: '', edition: '1st', language: 'English',
    reading_age: audience === 'children' ? '8-12 years' : 'All ages',
    audience: audience === 'children' ? 'Children' : audience === 'adult' ? 'Adult' : 'General',
    keywords, categories, bisac,
  }
}
