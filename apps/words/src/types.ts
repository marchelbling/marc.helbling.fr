export interface WordEntry {
  readonly word: string;
  readonly missing: string;
}

export interface WeekLesson {
  readonly week: number;
  readonly words: WordEntry[];
}

export type WordResult = 'correct' | 'wrong';

export interface GameState {
  readonly entries: readonly WordEntry[];
  readonly index: number;
  readonly score: number;
  readonly total: number;
  readonly failed: boolean;
  readonly results: readonly WordResult[];
}
