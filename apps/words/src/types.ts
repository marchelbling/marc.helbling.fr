export interface WordEntry {
  readonly word: string;
  readonly missing: string;
}

export interface WeekLesson {
  readonly week: number;
  readonly words: WordEntry[];
}

export interface GameState {
  readonly entries: readonly WordEntry[];
  readonly index: number;
  readonly score: number;
  readonly total: number;
}
