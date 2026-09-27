import { isBlank, titleCase } from "./text.ts"

/**
 * The fixture's second module. It uses the primitive in `text.ts` rather than
 * writing a second copy, so a healthy run reports no contract findings here.
 */

export const label = (name: string): string => (isBlank(name) ? "untitled" : titleCase(name))
