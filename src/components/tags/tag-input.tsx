'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Tag as TagIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import TagBadge from './tag-badge'
import {
  type Tag,
  TAG_COLORS,
  SUGGESTED_TAGS,
  isValidTagName,
  normalizeTagName,
  tagExists,
  getRandomTagColor,
} from '@/lib/utils/tags'

interface TagInputProps {
  tags: Tag[]
  onChange: (tags: Tag[]) => void
  availableTags?: Tag[]
  placeholder?: string
  maxTags?: number
}

export default function TagInput({
  tags,
  onChange,
  availableTags = [],
  placeholder = 'Add tag...',
  maxTags = 10,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on input
  const filteredSuggestions = [
    ...SUGGESTED_TAGS,
    ...availableTags.filter(
      (tag) => !SUGGESTED_TAGS.some((st) => st.name === tag.name)
    ),
  ].filter((tag) => {
    const searchTerm = inputValue.toLowerCase()
    return (
      tag.name.toLowerCase().includes(searchTerm) &&
      !tagExists(tags, tag.name)
    )
  })

  const handleAddTag = (tagName: string, tagColor: string) => {
    if (!isValidTagName(tagName) || tags.length >= maxTags) return

    const normalizedName = normalizeTagName(tagName)

    if (tagExists(tags, normalizedName)) return

    const newTag: Tag = {
      name: normalizedName,
      color: tagColor,
    }

    onChange([...tags, newTag])
    setInputValue('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleRemoveTag = (tagToRemove: Tag) => {
    onChange(tags.filter((tag) => tag.name !== tagToRemove.name))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      handleAddTag(inputValue, selectedColor)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag on backspace if input is empty
      onChange(tags.slice(0, -1))
    }
  }

  const handleSuggestionClick = (tag: Tag) => {
    handleAddTag(tag.name, tag.color)
  }

  return (
    <div className="space-y-2">
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge
              key={tag.name}
              tag={tag}
              onRemove={() => handleRemoveTag(tag)}
            />
          ))}
        </div>
      )}

      {/* Input */}
      {tags.length < maxTags && (
        <div className="flex gap-2">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    setIsOpen(true)
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsOpen(true)}
                  placeholder={placeholder}
                  className="pr-10"
                />
                <TagIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[400px] p-4"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="space-y-4">
                {/* Color Picker */}
                <div>
                  <p className="text-sm font-medium mb-2">Choose Color</p>
                  <div className="flex flex-wrap gap-2">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color.value
                            ? 'border-primary scale-110 shadow-md'
                            : 'border-gray-200 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                {filteredSuggestions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      {inputValue ? 'Matching Tags' : 'Suggested Tags'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {filteredSuggestions.slice(0, 8).map((tag) => (
                        <button
                          key={tag.name}
                          onClick={() => handleSuggestionClick(tag)}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <TagBadge tag={tag} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Create New Tag Button */}
                {inputValue.trim() && isValidTagName(inputValue) && (
                  <Button
                    onClick={() => handleAddTag(inputValue, selectedColor)}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{normalizeTagName(inputValue)}" tag
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Max tags hint */}
      {tags.length >= maxTags && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxTags} tags reached
        </p>
      )}
    </div>
  )
}
