import { TTS } from './tts.js';
import { loadWords } from './data.js';
import { createGame, checkAnswer, getDisplay, advance, addScore, isDone } from './game.js';
import type { GameState } from './types.js';

const tts = new TTS();
let state: GameState;
let answerEl: HTMLInputElement | null = null;

const wordEl = document.querySelector<HTMLElement>('#word')!;
const scoreEl = document.querySelector<HTMLElement>('#score')!;
const listenBtn = document.querySelector<HTMLButtonElement>('#listen')!;
const submitBtn = document.querySelector<HTMLButtonElement>('#submit')!;

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
  const inputWidth = Math.ceil(measureText(entry.missing)) + 8;
  const inputHTML = `<input id="answer" type="text"
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
      maxlength="${missingLen + 2}"
      style="width:${inputWidth}px" />`;
  wordEl.innerHTML = display.replace(/_+/, inputHTML);
  answerEl = document.querySelector<HTMLInputElement>('#answer')!;
  answerEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSubmit(); });
  scoreEl.textContent = `${state.score} / ${state.total}`;
  answerEl.focus();
  tts.speak(entry.word);
}

function onCorrect(): void {
  state = addScore(state);
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
  answerEl!.classList.remove('wrong');
  void answerEl!.offsetWidth; // force reflow to restart animation
  answerEl!.classList.add('wrong');
  answerEl!.select();
}

function showDone(): void {
  tts.cancel();
  wordEl.textContent = `Bravo ! ${state.score} / ${state.total}`;
  submitBtn.style.display = 'none';
  listenBtn.style.display = 'none';
  scoreEl.textContent = '';
}

function handleSubmit(): void {
  if (!answerEl || isDone(state) || answerEl.classList.contains('correct')) return;
  if (checkAnswer(state.entries[state.index]!, answerEl.value)) {
    onCorrect();
  } else {
    onWrong();
  }
}

submitBtn.addEventListener('click', handleSubmit);
listenBtn.addEventListener('click', () => {
  if (!isDone(state)) tts.speak(state.entries[state.index]!.word);
});

loadWords('./words.json').then(entries => {
  state = createGame(entries);
  renderWord();
}).catch((err: unknown) => {
  wordEl.textContent = 'Erreur de chargement.';
  console.error(err);
});
