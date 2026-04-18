/**
 * Data model for the phonemes app.
 *
 * A session asks the kid, for each of 15 French words, whether the word
 * contains the *voiced* or the *unvoiced* member of a phoneme pair.
 *
 * Voiced / unvoiced are linguistic terms: voiced sounds are made with the
 * vocal cords vibrating (/v/, /b/, /d/, /g/, /ʒ/, /z/), unvoiced ones
 * aren't (/f/, /p/, /t/, /k/, /ʃ/, /s/). Each pair shares a mouth position
 * and only differs in voicing — which is exactly what makes the pairs
 * confusing, and why we train the ear to hear the difference.
 *
 * We store the correct side of a `SoundEntry` as `"voiced" | "unvoiced"`
 * (not a literal letter) because one phoneme has multiple spellings:
 * /k/ is spelled c/k/qu/cc. Keeping the role abstract means the word entry
 * doesn't care about the grapheme.
 */

/** Which member of a pair: voiced = vocal cords vibrate; unvoiced = silent. */
export type Side = 'voiced' | 'unvoiced';

/** One side of a pair, as shown on its button. */
export interface PairSide {
  readonly ipa: string;     // e.g. "ʒ" — shown large inside /.../ on the button
  readonly letter: string;  // e.g. "j"  — French grapheme, shown smaller below
}

/** A confusable pair of phonemes, e.g. /ʒ/ vs /ʃ/. */
export interface Pair {
  readonly id: string;
  readonly voiced: PairSide;
  readonly unvoiced: PairSide;
}

/** One question: a word, the pair it probes, which side is correct, and the
 *  grapheme to emphasize when the word is revealed. */
export interface SoundEntry {
  readonly word: string;
  readonly pair: string;       // matches Pair.id
  readonly answer: Side;
  readonly highlight: string;  // substring of `word` spelling the target phoneme
  readonly emoji: string;
}

/** Shape of phonemes.json. */
export interface PhonemesData {
  readonly pairs: readonly Pair[];
  readonly words: readonly SoundEntry[];
}

/** Past-question outcome. */
export type SoundResult = 'correct' | 'wrong';

/** Immutable game state. Each transition returns a fresh object. */
export interface GameState {
  readonly entries: readonly SoundEntry[];
  readonly pairs: ReadonlyMap<string, Pair>;
  readonly index: number;
  readonly score: number;
  readonly total: number;
  readonly answered: boolean;  // has the kid clicked a button for this question?
  readonly lastCorrect: boolean;
  readonly results: readonly SoundResult[];
}
