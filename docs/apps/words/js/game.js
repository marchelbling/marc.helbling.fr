import { maskWord } from './data.js';
function normalize(s) {
    return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
export function checkAnswer(entry, input) {
    return normalize(input) === normalize(entry.missing);
}
export function createGame(entries) {
    return { entries, index: 0, score: 0, total: entries.length };
}
export function getDisplay(state) {
    const entry = state.entries[state.index];
    return maskWord(entry.word, entry.missing);
}
export function advance(state) {
    return { ...state, index: state.index + 1 };
}
export function addScore(state) {
    return { ...state, score: state.score + 1 };
}
export function isDone(state) {
    return state.index >= state.entries.length;
}
