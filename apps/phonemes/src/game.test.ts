import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, currentEntry, currentPair, pickSide, advance, isDone } from './game.js';
import { indexPairs } from './data.js';
import type { Pair, SoundEntry } from './types.js';

const pairs: Pair[] = [
  { id: 'v-f', voiced:  { ipa: 'v', letter: 'v' }, unvoiced: { ipa: 'f', letter: 'f' } },
];
const entries: SoundEntry[] = [
  { word: 'vélo', pair: 'v-f', answer: 'voiced',   highlight: 'v', emoji: '🚲' },
  { word: 'feu',  pair: 'v-f', answer: 'unvoiced', highlight: 'f', emoji: '🔥' },
];

function fresh() {
  return createGame(entries, indexPairs(pairs));
}

test('createGame: initial state', () => {
  const s = fresh();
  assert.equal(s.index, 0);
  assert.equal(s.score, 0);
  assert.equal(s.total, 2);
  assert.equal(s.answered, false);
  assert.deepEqual(s.results, []);
});

test('currentEntry / currentPair', () => {
  const s = fresh();
  assert.equal(currentEntry(s).word, 'vélo');
  assert.equal(currentPair(s).id, 'v-f');
});

test('pickSide: correct increments score, marks answered', () => {
  let s = fresh();
  s = pickSide(s, 'voiced');
  assert.equal(s.answered, true);
  assert.equal(s.lastCorrect, true);
  assert.equal(s.score, 1);
});

test('pickSide: wrong marks answered, score unchanged', () => {
  let s = fresh();
  s = pickSide(s, 'unvoiced');
  assert.equal(s.answered, true);
  assert.equal(s.lastCorrect, false);
  assert.equal(s.score, 0);
});

test('pickSide: is idempotent — further clicks ignored', () => {
  let s = fresh();
  s = pickSide(s, 'unvoiced'); // wrong
  s = pickSide(s, 'voiced');   // would be correct but must be ignored
  assert.equal(s.lastCorrect, false);
  assert.equal(s.score, 0);
});

test('pickSide: immutable — original unchanged', () => {
  const s0 = fresh();
  pickSide(s0, 'voiced');
  assert.equal(s0.answered, false);
  assert.equal(s0.score, 0);
});

test('advance: appends result, resets transient flags', () => {
  let s = fresh();
  s = pickSide(s, 'voiced');
  s = advance(s);
  assert.equal(s.index, 1);
  assert.equal(s.answered, false);
  assert.equal(s.lastCorrect, false);
  assert.deepEqual(s.results, ['correct']);
});

test('advance: wrong outcome recorded', () => {
  let s = fresh();
  s = pickSide(s, 'unvoiced');
  s = advance(s);
  assert.deepEqual(s.results, ['wrong']);
});

test('isDone: true after answering all', () => {
  let s = fresh();
  assert.ok(!isDone(s));
  s = advance(pickSide(s, 'voiced'));
  assert.ok(!isDone(s));
  s = advance(pickSide(s, 'unvoiced'));
  assert.ok(isDone(s));
});
