import type { WordEntry, WeekLesson } from './types.js';

export function maskWord(word: string, missing: string): string {
  return word.replace(missing, '_'.repeat(missing.length));
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export async function loadWords(url: string): Promise<WordEntry[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load words: ${res.status}`);
  const weeks: WeekLesson[] = await res.json() as WeekLesson[];
  const flat = weeks.flatMap(w => w.words);
  return shuffle(flat).slice(0, 15);
}
