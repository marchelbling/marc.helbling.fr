import { TTS } from './tts.js';
import { loadWords } from './data.js';
import { createGame, checkAnswer, getDisplay, advance, addScore, markFailed, isDone } from './game.js';
import type { GameState } from './types.js';

const tts = new TTS();
let state: GameState;
let answerEl: HTMLInputElement | null = null;

const wordEl = document.querySelector<HTMLElement>('#word')!;
const scoreEl = document.querySelector<HTMLElement>('#score')!;
const progressEl = document.querySelector<HTMLElement>('#progress')!;
const listenBtn = document.querySelector<HTMLButtonElement>('#listen')!;
const submitBtn = document.querySelector<HTMLButtonElement>('#submit')!;
const startBtn = document.querySelector<HTMLButtonElement>('#start')!;

function renderProgress(): void {
  const dots: string[] = [];
  for (let i = 0; i < state.total; i++) {
    const isPast = i < state.results.length;
    const cls = isPast
      ? state.results[i]!
      : i === state.index
        ? (state.failed ? 'wrong current' : 'current')
        : 'pending';
    const title = isPast ? ` title="${state.entries[i]!.word}"` : '';
    dots.push(`<span class="dot ${cls}"${title}></span>`);
  }
  progressEl.innerHTML = dots.join('');
}

function measureText(text: string): number {
  const ruler = document.createElement('span');
  ruler.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font:inherit;letter-spacing:inherit;';
  ruler.textContent = text;
  wordEl.appendChild(ruler);
  const w = ruler.getBoundingClientRect().width;
  ruler.remove();
  return w;
}

function renderWord(): void {
  const entry = state.entries[state.index]!;
  const display = getDisplay(state);
  const missingLen = entry.missing.length;
  const inputWidth = Math.ceil(measureText(entry.missing) + measureText('m'));
  const inputHTML = `<input id="answer" type="text"
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
      maxlength="${missingLen + 2}"
      style="width:${inputWidth}px" />`;
  wordEl.innerHTML = display.replace(/_+/, inputHTML);
  answerEl = document.querySelector<HTMLInputElement>('#answer')!;
  answerEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSubmit(); });
  scoreEl.textContent = `${state.score} / ${state.total}`;
  renderProgress();
  answerEl.focus();
  void speakWord(entry.word);
}

function onCorrect(): void {
  if (!state.failed) state = addScore(state);
  answerEl!.className = 'correct';
  answerEl!.disabled = true;
  scoreEl.textContent = `${state.score} / ${state.total}`;
  setTimeout(() => {
    state = advance(state);
    if (isDone(state)) {
      showDone();
    } else {
      renderWord();
    }
  }, 1500);
}

function onWrong(): void {
  state = markFailed(state);
  answerEl!.classList.remove('wrong');
  void answerEl!.offsetWidth; // force reflow to restart animation
  answerEl!.classList.add('wrong');
  renderProgress();
  answerEl!.select();
}

function showDone(): void {
  tts.cancel();
  wordEl.textContent = `Bravo ! ${state.score} / ${state.total}`;
  submitBtn.style.display = 'none';
  listenBtn.style.display = 'none';
  scoreEl.textContent = '';
  renderProgress();
}

function handleSubmit(): void {
  if (!answerEl || isDone(state) || answerEl.classList.contains('correct')) return;
  if (checkAnswer(state.entries[state.index]!, answerEl.value)) {
    onCorrect();
  } else {
    onWrong();
  }
}

async function speakWord(word: string): Promise<void> {
  listenBtn.disabled = true;
  await tts.speak(word);
  listenBtn.disabled = false;
}

submitBtn.addEventListener('click', handleSubmit);
listenBtn.addEventListener('click', () => {
  if (!isDone(state)) void speakWord(state.entries[state.index]!.word);
});

const wordsPromise = loadWords('./words.json');
wordsPromise.catch((err: unknown) => {
  wordEl.textContent = 'Erreur de chargement.';
  console.error(err);
});

startBtn.addEventListener('click', () => {
  wordsPromise.then(entries => {
    state = createGame(entries);
    startBtn.style.display = 'none';
    listenBtn.style.display = '';
    submitBtn.style.display = '';
    renderWord();
  });
});
