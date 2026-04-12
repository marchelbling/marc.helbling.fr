import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maskWord, shuffle } from './data.js';

test('maskWord replaces prefix', () => {
  assert.equal(maskWord('guitare', 'gui'), '___tare');
});

test('maskWord replaces suffix', () => {
  assert.equal(maskWord('guitare', 're'), 'guita__');
});

test('maskWord replaces middle', () => {
  assert.equal(maskWord('château', 'âteau'), 'ch_____');
});

test('maskWord handles accented missing', () => {
  assert.equal(maskWord('fenêtre', 'fen'), '___être');
});

test('shuffle returns a permutation of the input', () => {
  const arr = [1, 2, 3, 4, 5];
  const result = shuffle(arr);
  assert.equal(result.length, arr.length);
  assert.deepEqual([...result].sort((a, b) => a - b), arr);
});

test('shuffle does not mutate the input', () => {
  const arr = [1, 2, 3];
  shuffle(arr);
  assert.deepEqual(arr, [1, 2, 3]);
});

test('shuffle handles empty array', () => {
  assert.deepEqual(shuffle([]), []);
});
