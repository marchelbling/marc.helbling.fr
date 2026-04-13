import { maskWord } from './data.js';
export function checkAnswer(entry, input) {
    return input.trim().toLowerCase() === entry.missing.toLowerCase();
}
export function createGame(entries) {
    return { entries, index: 0, score: 0, total: entries.length, failed: false, results: [] };
}
export function getDisplay(state) {
    const entry = state.entries[state.index];
    return maskWord(entry.word, entry.missing);
}
export function markFailed(state) {
    return { ...state, failed: true };
}
export function advance(state) {
    const result = state.failed ? 'wrong' : 'correct';
    return { ...state, index: state.index + 1, failed: false, results: [...state.results, result] };
}
export function addScore(state) {
    return { ...state, score: state.score + 1 };
}
export function isDone(state) {
    return state.index >= state.entries.length;
}
