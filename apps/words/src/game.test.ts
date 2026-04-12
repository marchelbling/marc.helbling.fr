import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkAnswer, createGame, getDisplay, advance, addScore, markFailed, isDone } from './game.js';
import type { WordEntry } from './types.js';

const entries: WordEntry[] = [
  { word: 'guitare', missing: 'gui' },
  { word: 'fenêtre', missing: 'fenê' },
];

test('checkAnswer: correct exact match', () => {
  assert.ok(checkAnswer(entries[0]!, 'gui'));
});

test('checkAnswer: case-insensitive', () => {
  assert.ok(checkAnswer(entries[0]!, 'GUI'));
  assert.ok(checkAnswer(entries[0]!, 'Gui'));
});

test('checkAnswer: accents required', () => {
  assert.ok(!checkAnswer(entries[1]!, 'fen'));
  assert.ok(checkAnswer(entries[1]!, 'fenê'));
});

test('checkAnswer: trims whitespace', () => {
  assert.ok(checkAnswer(entries[0]!, '  gui  '));
});

test('checkAnswer: wrong answer', () => {
  assert.ok(!checkAnswer(entries[0]!, 'abc'));
  assert.ok(!checkAnswer(entries[0]!, ''));
});

test('getDisplay masks first occurrence', () => {
  const state = createGame(entries);
  assert.equal(getDisplay(state), '___tare');
});

test('advance increments index', () => {
  const state = createGame(entries);
  assert.equal(advance(state).index, 1);
  assert.equal(state.index, 0); // immutable
});

test('addScore increments score', () => {
  const state = createGame(entries);
  assert.equal(addScore(state).score, 1);
  assert.equal(state.score, 0); // immutable
});

test('markFailed sets failed flag, advance resets it', () => {
  let state = createGame(entries);
  assert.equal(state.failed, false);
  state = markFailed(state);
  assert.equal(state.failed, true);
  state = advance(state);
  assert.equal(state.failed, false);
});

test('isDone when index equals total', () => {
  let state = createGame(entries);
  assert.ok(!isDone(state));
  state = advance(advance(state));
  assert.ok(isDone(state));
});
