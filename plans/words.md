# Words app — plan

## Context

A standalone full-screen web app to help a kid with ADHD practice French spelling.
The app shows a word with some letters hidden (e.g. `___tare` for `guitare`) and the
kid types the missing part. Text-to-speech pronounces the word automatically. A score
is tracked for the session.

The app is hosted at `marc.helbling.fr/apps/words/` as a static page, completely
independent of the Hugo blog (no blog chrome, no Hugo template). Hugo copies `static/`
verbatim so the page lives in `static/apps/words/index.html`.

TypeScript is compiled via `tsc` only — no bundler. ES modules are emitted and loaded
via `<script type="module">` in the browser. `typescript` is a local devDependency in
`apps/words/package.json`.

## Coding philosophy

- **Standard library only** — no runtime dependencies, no framework. Browser APIs (`fetch`, `speechSynthesis`, DOM) and TypeScript's standard lib cover everything needed.
- **Simple over clever** — each module does one thing, functions are short and readable. Prefer explicitness over abstraction.
- **Modular** — logic is split into small focused modules with clear boundaries. Business logic (game, data) is decoupled from the DOM (main) so it can be tested and reasoned about independently.
- **Tests are not an afterthought** — each module is written alongside its tests. Pure functions (`checkAnswer`, `maskWord`, shuffle) have unit tests using `node --test` (built into Node 18+, no extra dependency). DOM-heavy code (main) is smoke-tested manually in the browser.

## Data format

```json
[
  {
    "week": 1,
    "words": [
      { "word": "guitare", "missing": "gui" },
      { "word": "guitare", "missing": "re" },
      { "word": "fenêtre", "missing": "fen" }
    ]
  }
]
```

All weeks are concatenated into a flat list and shuffled (Fisher-Yates) at session start.
`missing` is a single substring that can appear anywhere in the word. The display replaces
its first occurrence with `_` × its length. The expected answer is `missing`, compared
case- and accent-insensitively.

To practice multiple sounds in the same word, duplicate the entry with a different `missing`.

## Module structure

| File | Responsibility | Key TS concepts |
|---|---|---|
| `types.ts` | `WordEntry`, `WeekLesson`, `GameState` interfaces | `interface`, `type`, `readonly` |
| `data.ts` | fetch words.json, flatten weeks, shuffle, mask helper | `async/await`, `fetch`, generics |
| `tts.ts` | `TTS` class wrapping `speechSynthesis`, French voice | class, optional chaining, browser API typing |
| `game.ts` | pure state: score, current word, answer checking | state object, pure functions |
| `main.ts` | DOM, event handlers, wires all modules | DOM typing, `querySelector`, events |

## UX

- Full-screen centered flex layout, clean, no blog chrome
- Masked word displayed at ~5rem, `_` styled as visible underline per missing character
- TTS fires automatically on each new word + "Écouter" button to replay
- Single large input, auto-focused, submit on Enter or button
- Wrong answer: shake animation + red border, input kept as-is (no clear, no reveal — kid should reflect)
- Correct answer: green flash, auto-advance after 1.5s
- Score counter `X / Y` displayed unobtrusively

## Action items

### Setup
- [x] Create `apps/words/package.json` with `typescript` as devDependency
- [x] Create `apps/words/tsconfig.json` — `ES2020` modules, strict, `outDir` → `../../static/apps/words/js`
- [x] Add `static/apps/words/js/` to `.gitignore`
- [x] Add `build-words` and `test-words` targets to `Makefile`; wire `test-words` into `build-words` so tests run on every build

### TypeScript source (`apps/words/src/`)
- [x] `types.ts` — `WordEntry`, `WeekLesson`, `GameState` interfaces
- [x] `data.ts` + `data.test.ts` — fetch + flatten weeks + Fisher-Yates shuffle + mask-word helper; tests cover `maskWord` (substring replacement, accent handling) and `shuffle` (output is a permutation of input)
- [x] `tts.ts` — `TTS` class wrapping `speechSynthesis`, selects first `fr-FR` voice, exposes `speak(text)` and `cancel()` (no unit tests — browser API only)
- [x] `game.ts` + `game.test.ts` — pure state: current word index, score, `checkAnswer(input): boolean`, `advance()`, `getDisplay()`; tests cover `checkAnswer` (case-insensitive, accent-insensitive, wrong input)
- [x] `main.ts` — wires DOM, auto-speaks on new word, shake + red border on wrong (no clear, no reveal), green flash + auto-advance after 1.5s on correct, updates score (smoke-tested manually)

### Static assets
- [x] `static/apps/words/index.html` — standalone full-screen page, loads `js/main.js` as `type="module"`, contains app skeleton (`#word`, `#answer`, `#score`, Écouter button)
- [x] `static/apps/words/words.json` — placeholder with 2–3 sample words so the app runs immediately
- [x] **Consolidate real word list** from school lessons into `words.json`, grouped by week (22 weeks)
- [x] CSS (inline in `index.html` or sibling `style.css`): full-screen flex, 5rem word font, large input, shake keyframe, red/green state classes

### Validation
- [x] Run `npm install` in `apps/words/`, confirm `tsc` compiles cleanly
- [ ] Open `static/apps/words/index.html` in browser (file://) and smoke-test: word displays, TTS fires, correct answer advances, wrong answer shakes without clearing input
- [x] Run `make generate`, confirm `docs/apps/words/` is present and the page works
