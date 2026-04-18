import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shuffle, indexPairs, highlightWord, maskWord } from './data.js';
import type { Pair } from './types.js';

test('shuffle: returns a permutation', () => {
  const input = [1, 2, 3, 4, 5];
  const out = shuffle(input);
  assert.equal(out.length, input.length);
  assert.deepEqual([...out].sort(), [...input].sort());
});

test('shuffle: does not mutate input', () => {
  const input = [1, 2, 3];
  shuffle(input);
  assert.deepEqual(input, [1, 2, 3]);
});

test('indexPairs: looks up by id', () => {
  const pairs: Pair[] = [
    { id: 'v-f', voiced:  { ipa: 'v', letter: 'v' }, unvoiced: { ipa: 'f', letter: 'f' } },
    { id: 'b-p', voiced:  { ipa: 'b', letter: 'b' }, unvoiced: { ipa: 'p', letter: 'p' } },
  ];
  const map = indexPairs(pairs);
  assert.equal(map.get('v-f')!.voiced.ipa, 'v');
  assert.equal(map.get('b-p')!.unvoiced.letter, 'p');
  assert.equal(map.get('nope'), undefined);
});

test('highlightWord: wraps first occurrence', () => {
  assert.equal(highlightWord('chat', 'ch'), '<mark>ch</mark>at');
  assert.equal(highlightWord('maison', 's'), 'mai<mark>s</mark>on');
  assert.equal(highlightWord('éléphant', 'ph'), 'élé<mark>ph</mark>ant');
});

test('highlightWord: first occurrence only', () => {
  // Hypothetical word with two matches; only the first is wrapped.
  assert.equal(highlightWord('chachacha', 'ch'), '<mark>ch</mark>achacha');
});

test('highlightWord: missing substring returns word unchanged', () => {
  assert.equal(highlightWord('vélo', 'z'), 'vélo');
});

test('maskWord: replaces first occurrence with matching-length underscores', () => {
  assert.equal(maskWord('kangourou', 'k'), '_angourou');
  assert.equal(maskWord('kangourou', 'g'), 'kan_ourou');
  assert.equal(maskWord('éléphant', 'ph'), 'élé__ant');
  assert.equal(maskWord('raisin', 's'), 'rai_in');
});

test('maskWord: missing substring returns word unchanged', () => {
  assert.equal(maskWord('vélo', 'z'), 'vélo');
});
