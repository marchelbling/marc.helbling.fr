# Phonemes app — plan

## Context

A second standalone full-screen web app for the same ADHD kid. Goal: train the
ear to distinguish confusing French phoneme pairs so spelling improves.

Flow per question:
1. A word is played (audio only, nothing written).
2. Two buttons show the candidate phonemes (IPA + French grapheme).
3. The kid clicks the one he hears in the word.
4. The word is revealed with the confusing grapheme emphasized, plus a
   "Suivant" button to move on.
5. 15 questions per session, then a final score.

Lives at `marc.helbling.fr/apps/phonemes/`. Same constraints as the `words`
app: static page, standalone, TS compiled by `tsc` only, no runtime
dependencies, Piper TTS pre-generates OGG audio, fallback to browser synthesis.

## Phoneme pairs

Six pairs, all voiced ↔ unvoiced cognates (same mouth position, voice on/off —
the classic confusion axis):

| Pair id | Voiced | Unvoiced | Typical French graphemes |
|---|---|---|---|
| `v-f`   | /v/ | /f/ | v · f / ph |
| `b-p`   | /b/ | /p/ | b · p |
| `d-t`   | /d/ | /t/ | d · t |
| `g-k`   | /g/ | /k/ | g / gu · c / qu / k |
| `zh-sh` | /ʒ/ | /ʃ/ | j / ge · ch |
| `z-s`   | /z/ | /s/ | z / s (between vowels) · s / ss / c / ç |

Note: the user's original list contained both `qu/gu` and `k/g`. These are the
same phoneme pair with different spellings, so we collapse them into `g-k` and
just pick words that cover the spelling variety.

Mixed pairs within a session (no selector — 15 questions drawn from any pair).
If it turns out to be too hard later, a simple selector can be added.

## Data format

`static/apps/phonemes/phonemes.json`:

```json
{
  "pairs": [
    { "id": "v-f",   "voiced":  { "ipa": "v", "letter": "v" },
                      "unvoiced": { "ipa": "f", "letter": "f" } },
    { "id": "zh-sh", "voiced":  { "ipa": "ʒ", "letter": "j" },
                      "unvoiced": { "ipa": "ʃ", "letter": "ch" } }
  ],
  "words": [
    { "word": "vélo",   "pair": "v-f",   "answer": "voiced",   "highlight": "v",  "emoji": "🚲" },
    { "word": "chat",   "pair": "zh-sh", "answer": "unvoiced", "highlight": "ch", "emoji": "🐱" },
    { "word": "maison", "pair": "z-s",   "answer": "voiced",   "highlight": "s",  "emoji": "🏠" }
  ]
}
```

Key points:
- The pair object has two sides: `voiced` and `unvoiced`. These are linguistic
  terms — voiced sounds are made with the vocal cords vibrating (/v/, /b/,
  /d/, /g/, /ʒ/, /z/), unvoiced ones aren't (/f/, /p/, /t/, /k/, /ʃ/, /s/).
  That's precisely *why* these pairs are confusing to the ear: same mouth
  position, voicing is the only difference.
- `answer` on a word says *which side* is correct (`"voiced"` or
  `"unvoiced"`). It refers back to the pair's key.
- Why not a literal letter like `"answer": "k"`? Because a single phoneme has
  multiple spellings (`carotte`→c, `koala`→k, `qui`→qu — all /k/). The
  voiced/unvoiced label is spelling-independent, so the word entry stays
  stable even when the grapheme changes.
- `highlight` is the grapheme to emphasize when the word is revealed. It can
  differ from the pair's `letter` (e.g. `maison` → sound /z/, spelled `s`).
- `emoji` is the word's illustration. Constraint: every word must have a
  clear, unambiguous emoji → limits the vocabulary to concrete nouns, which
  is what a 6-10 year old recognizes fastest anyway.
- Each word entry targets one phoneme; if a word has both sounds, duplicate it
  with different `highlight` values (like the `words` app does for `missing`).

## Word list

Target ≥20 words per pair × 6 pairs = 120+ words, drawn from common
vocabulary a 6-10 year old knows. Constraint: each word must have a clear
emoji. Kickstart list lives in `phonemes.json`; delivered as its own commit
for user review before any app code is written.

## Module structure

Same anatomy as the `words` app. Each file intentionally teaches one or two
TS / JS concepts (the user wants to learn as we go):

| File | Responsibility | Concepts to surface |
|---|---|---|
| `types.ts` | `Pair`, `SoundEntry`, `GameState` interfaces | `interface`, discriminated union (`answer: "voiced" \| "unvoiced"`), `readonly` |
| `data.ts` + `data.test.ts` | fetch + shuffle + pick 15; pair lookup helper | `async/await`, `fetch`, generics, `Map` vs plain object |
| `tts.ts` | reused pattern from words — pre-generated OGG, browser fallback | class, Promises, browser APIs |
| `game.ts` + `game.test.ts` | pure state: current index, score, `pickSide(state, side)`, `advance`, `isDone` | immutable state with spread, pure functions, testing pure logic |
| `main.ts` | DOM, event handlers, wires all modules | `querySelector<T>` typing, events, template strings, CSS class toggling |

The user is new-ish to JS so, while building, I'll call out:
- Why `.js` in import paths despite `.ts` files (native ESM resolution after compile).
- Why we use `readonly` + spread for state (prevents accidental mutation, makes
  tests trivial).
- The difference between `null` and `undefined` in the `querySelector` null-check `!`.
- Why `async` functions always return a Promise, and how `await` unwraps it.
- DOM event listeners vs React-style rerender (this codebase does imperative
  DOM updates — simpler, no framework).
- Why tests live beside source and are excluded from the browser bundle via
  `tsconfig.json` → separate `tsconfig.test.json`.

## UX

- Full-screen centered, same font (OpenDyslexic) and palette as `words`.
- Layout (desktop + mobile), top to bottom:
  - Score `X / 15` (tucked top-right, like words app)
  - Big emoji (~6rem) — the word's illustration
  - "Écouter" button (auto-plays on load, re-plays on click)
  - Two phoneme buttons side-by-side. Each shows `/IPA/` on top (large)
    and the French grapheme (smaller) below. Clicking commits an answer.
  - Reveal area (empty before answer): shows the word with the
    `highlight` grapheme wrapped in a coloured span once the kid answers.
  - "Suivant" button (hidden before answer).
  - Progress dots (same as words app).
- Answer feedback:
  - **Correct**: chosen button flashes green.
  - **Wrong**: chosen button flashes red. No auto-advance, no second chance
    (only 2 options — forcing a retry reveals the answer anyway).
  - In both cases the word reveals under the buttons. "Écouter" stays live
    so the kid can replay and reflect. "Suivant" appears and takes focus.
- End: "Bravo ! X / 15", progress dots remain, Écouter / buttons hidden.

## Action items

### Setup
- [ ] `apps/phonemes/package.json` mirrors `apps/words/package.json` (same
      `build` / `test` / `build-all` scripts, `typescript` devDep).
- [ ] `apps/phonemes/tsconfig.json` mirrors words', `outDir` →
      `../../static/apps/phonemes/js`.
- [ ] `apps/phonemes/tsconfig.test.json` mirrors words'.
- [ ] `.gitignore` — add `static/apps/phonemes/js/`.
- [ ] `Makefile` — add `build-phonemes`, `test-phonemes`, `phonemes-audio`
      targets; wire `build-phonemes` into `generate`.

### TypeScript source (`apps/phonemes/src/`)
- [ ] `types.ts` — `Pair`, `PairSide`, `SoundEntry`, `SoundsData`, `GameState`.
- [ ] `data.ts` + `data.test.ts` — fetch + shuffle + slice(15) + pair-by-id
      lookup. Reuse Fisher-Yates from words pattern. Tests: shuffle is a
      permutation, pair lookup returns correct object.
- [ ] `tts.ts` — copy from `apps/words/src/tts.ts` nearly verbatim (it only
      depends on the audio index path). Consider extracting to a shared
      module later if a third app appears; for now duplicate to keep
      apps fully independent (matches project philosophy).
- [ ] `game.ts` + `game.test.ts` — `createGame`, `pickSide(state, side)` →
      returns `{state, correct}`, `advance`, `isDone`, immutable state.
      Tests cover correct/wrong picks, score math, advance resets transient
      state.
- [ ] `main.ts` — DOM wiring, auto-speak on new word, button handlers,
      reveal helper that wraps `highlight` in `<mark>` inside the word.

### Static assets
- [ ] `static/apps/phonemes/index.html` — standalone page. Inline CSS, same
      palette as words. Elements: `#listen`, `#buttons` (two `.phoneme`
      buttons with `data-side="voiced"` / `"unvoiced"`), `#reveal`,
      `#next`, `#score`, `#progress`, `#start`.
- [ ] `static/apps/phonemes/phonemes.json` — kickstart word list
      (≥20 per pair, each with an emoji).
- [ ] `apps/phonemes/scripts/generate_audio.py` — mirrors the words version;
      reads `phonemes.json`, generates one OGG per unique word into
      `static/apps/phonemes/audio/`.

### Validation
- [ ] `npm install` in `apps/phonemes`, `npm run build-all` passes.
- [ ] Generate audio, open `static/apps/phonemes/index.html`, smoke-test:
      word plays, correct/wrong highlight, suivant advances, end screen.
- [ ] `make generate` produces `docs/apps/phonemes/` with assets.

## Decisions (resolved)

1. **Name / URL** → `phonemes`.
2. **Reveal colour** → reuse the words-app blue. If we ever want to
   differentiate the two apps, update both together.
3. **Illustrations** → one emoji per word (`emoji` field). No sourced/drawn
   images.
4. **Word list** → delivered as its own review-only commit before any
   app code lands.
