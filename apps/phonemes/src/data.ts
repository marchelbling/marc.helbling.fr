import type { Pair, PhonemesData, SoundEntry } from './types.js';

/** Fisher-Yates shuffle — returns a new array, leaves input untouched. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Build a Map for O(1) pair lookups by id. */
export function indexPairs(pairs: readonly Pair[]): Map<string, Pair> {
  return new Map(pairs.map(p => [p.id, p]));
}

/** Wrap the first occurrence of `highlight` in `word` with <mark>…</mark>.
 *  Everything else is returned as a plain string — the caller decides how
 *  to insert the resulting HTML. */
export function highlightWord(word: string, highlight: string): string {
  const i = word.indexOf(highlight);
  if (i < 0) return word;
  return word.slice(0, i) + `<mark>${highlight}</mark>` + word.slice(i + highlight.length);
}

/** Replace the first occurrence of `highlight` in `word` with underscores
 *  of matching length — shows the kid *where* the target phoneme lives
 *  without revealing the letters themselves. */
export function maskWord(word: string, highlight: string): string {
  const i = word.indexOf(highlight);
  if (i < 0) return word;
  return word.slice(0, i) + '_'.repeat(highlight.length) + word.slice(i + highlight.length);
}

export async function loadPhonemes(url: string): Promise<{
  pairs: Map<string, Pair>;
  entries: SoundEntry[];
}> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load phonemes: ${res.status}`);
  const data = await res.json() as PhonemesData;
  return {
    pairs: indexPairs(data.pairs),
    entries: shuffle(data.words).slice(0, 15),
  };
}
