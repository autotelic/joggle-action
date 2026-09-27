/**
 * Text helpers, kept in their own module so the fixture has a real cross-file
 * shape for joggle to index.
 */

export const titleCase = (text: string): string =>
  text.length === 0 ? text : text[0]!.toUpperCase() + text.slice(1).toLowerCase()

export const isBlank = (text: string): boolean => text.trim().length === 0
