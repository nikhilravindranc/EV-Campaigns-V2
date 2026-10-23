import type { EmailBlock } from "@/lib/types/templates";

/** A block (or blocks) saved to reuse in other emails. Kept in this browser. */
export interface SavedSection {
  id: string;
  name: string;
  blocks: EmailBlock[];
  savedAt: string;
}

export const SECTIONS_KEY = "evoq-campaigns:saved-sections";
export const NO_SECTIONS: SavedSection[] = [];
export const MAX_SECTIONS = 20;
