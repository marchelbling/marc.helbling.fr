import type { WordEntry, GameState } from './types.js';
import { maskWord } from './data.js';

export function checkAnswer(entry: WordEntry, input: string): boolean {
  return input.trim().toLowerCase() === entry.missing.toLowerCase();
}

export function createGame(entries: readonly WordEntry[]): GameState {
  return { entries, index: 0, score: 0, total: entries.length, failed: false, results: [] };
}

export function getDisplay(state: GameState): string {
  const entry = state.entries[state.index]!;
  return maskWord(entry.word, entry.missing);
}

export function markFailed(state: GameState): GameState {
  return { ...state, failed: true };
}

export function advance(state: GameState): GameState {
  const result: 'correct' | 'wrong' = state.failed ? 'wrong' : 'correct';
  return { ...state, index: state.index + 1, failed: false, results: [...state.results, result] };
}

export function addScore(state: GameState): GameState {
  return { ...state, score: state.score + 1 };
}

export function isDone(state: GameState): boolean {
  return state.index >= state.entries.length;
}
