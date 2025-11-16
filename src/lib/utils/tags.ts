export interface Tag {
  name: string
  color: string
}

// Predefined beautiful color palette for tags (2025 modern design)
export const TAG_COLORS = [
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  { name: 'Purple', value: '#8b5cf6', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  { name: 'Pink', value: '#ec4899', bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  { name: 'Green', value: '#10b981', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  { name: 'Yellow', value: '#f59e0b', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  { name: 'Red', value: '#ef4444', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  { name: 'Emerald', value: '#059669', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  { name: 'Slate', value: '#64748b', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
]

// Predefined common tags with suggested colors
export const SUGGESTED_TAGS: Tag[] = [
  { name: 'Senior', color: '#3b82f6' },
  { name: 'Junior', color: '#10b981' },
  { name: 'Mid-Level', color: '#8b5cf6' },
  { name: 'Remote', color: '#14b8a6' },
  { name: 'Urgent', color: '#ef4444' },
  { name: 'Top Candidate', color: '#f59e0b' },
  { name: 'Interview Ready', color: '#ec4899' },
  { name: 'Follow Up', color: '#f97316' },
  { name: 'Referred', color: '#6366f1' },
  { name: 'Relocation', color: '#06b6d4' },
]

/**
 * Get color classes for a tag based on its hex color
 */
export function getTagColorClasses(hexColor: string): {
  bg: string
  text: string
  border: string
} {
  const colorMatch = TAG_COLORS.find((c) => c.value === hexColor)
  if (colorMatch) {
    return {
      bg: colorMatch.bg,
      text: colorMatch.text,
      border: colorMatch.border,
    }
  }

  // Default to blue if color not found
  return {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  }
}

/**
 * Get a random color from the palette
 */
export function getRandomTagColor(): string {
  const randomIndex = Math.floor(Math.random() * TAG_COLORS.length)
  return TAG_COLORS[randomIndex].value
}

/**
 * Validate tag name
 */
export function isValidTagName(name: string): boolean {
  return name.trim().length > 0 && name.trim().length <= 30
}

/**
 * Normalize tag name (trim, capitalize first letter)
 */
export function normalizeTagName(name: string): string {
  const trimmed = name.trim()
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

/**
 * Check if a tag already exists in a list (case-insensitive)
 */
export function tagExists(tags: Tag[], tagName: string): boolean {
  return tags.some((tag) => tag.name.toLowerCase() === tagName.toLowerCase())
}

/**
 * Get unique tags from multiple candidates
 */
export function getUniqueTags(candidatesTags: Tag[][]): Tag[] {
  const tagMap = new Map<string, Tag>()

  candidatesTags.forEach((tags) => {
    tags.forEach((tag) => {
      const key = tag.name.toLowerCase()
      if (!tagMap.has(key)) {
        tagMap.set(key, tag)
      }
    })
  })

  return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}
