import type { GameState, Pair, Side, SoundEntry, SoundResult } from './types.js';

export function createGame(
  entries: readonly SoundEntry[],
  pairs: ReadonlyMap<string, Pair>,
): GameState {
  return {
    entries,
    pairs,
    index: 0,
    score: 0,
    total: entries.length,
    answered: false,
    lastCorrect: false,
    results: [],
  };
}

export function currentEntry(state: GameState): SoundEntry {
  return state.entries[state.index]!;
}

export function currentPair(state: GameState): Pair {
  const entry = currentEntry(state);
  const pair = state.pairs.get(entry.pair);
  if (!pair) throw new Error(`Unknown pair: ${entry.pair}`);
  return pair;
}

/** Record an answer. Idempotent: once a question is answered, further clicks
 *  are ignored (returns the state untouched). */
export function pickSide(state: GameState, side: Side): GameState {
  if (state.answered) return state;
  const correct = currentEntry(state).answer === side;
  return {
    ...state,
    answered: true,
    lastCorrect: correct,
    score: correct ? state.score + 1 : state.score,
  };
}

export function advance(state: GameState): GameState {
  const result: SoundResult = state.lastCorrect ? 'correct' : 'wrong';
  return {
    ...state,
    index: state.index + 1,
    answered: false,
    lastCorrect: false,
    results: [...state.results, result],
  };
}

export function isDone(state: GameState): boolean {
  return state.index >= state.entries.length;
}
