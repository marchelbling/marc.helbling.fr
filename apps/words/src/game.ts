import type { WordEntry, GameState } from './types.js';
import { maskWord } from './data.js';

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function checkAnswer(entry: WordEntry, input: string): boolean {
  return normalize(input) === normalize(entry.missing);
}

export function createGame(entries: readonly WordEntry[]): GameState {
  return { entries, index: 0, score: 0, total: entries.length };
}

export function getDisplay(state: GameState): string {
  const entry = state.entries[state.index]!;
  return maskWord(entry.word, entry.missing);
}

export function advance(state: GameState): GameState {
  return { ...state, index: state.index + 1 };
}

export function addScore(state: GameState): GameState {
  return { ...state, score: state.score + 1 };
}

export function isDone(state: GameState): boolean {
  return state.index >= state.entries.length;
}
