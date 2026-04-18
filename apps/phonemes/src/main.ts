import { TTS } from './tts.js';
import { loadPhonemes, highlightWord, maskWord } from './data.js';
import {
  createGame, currentEntry, currentPair, pickSide, advance, isDone,
} from './game.js';
import type { GameState, Side } from './types.js';

const tts = new TTS();
let state: GameState;

const emojiEl     = document.querySelector<HTMLElement>('#emoji')!;
const listenBtn   = document.querySelector<HTMLButtonElement>('#listen')!;
const btnVoiced   = document.querySelector<HTMLButtonElement>('#voiced')!;
const btnUnvoiced = document.querySelector<HTMLButtonElement>('#unvoiced')!;
const revealEl    = document.querySelector<HTMLElement>('#reveal')!;
const hintEl      = document.querySelector<HTMLElement>('#hint')!;
const nextBtn     = document.querySelector<HTMLButtonElement>('#next')!;
const scoreEl     = document.querySelector<HTMLElement>('#score')!;
const progressEl  = document.querySelector<HTMLElement>('#progress')!;
const startBtn    = document.querySelector<HTMLButtonElement>('#start')!;

function renderProgress(): void {
  const dots: string[] = [];
  for (let i = 0; i < state.total; i++) {
    const isPast = i < state.results.length;
    const isCurrent = i === state.index;
    let cls: string;
    if (isPast) {
      cls = state.results[i]!;
    } else if (isCurrent && state.answered) {
      cls = state.lastCorrect ? 'current correct' : 'current wrong';
    } else if (isCurrent) {
      cls = 'current';
    } else {
      cls = 'pending';
    }
    const title = isPast ? ` title="${state.entries[i]!.word}"` : '';
    dots.push(`<span class="dot ${cls}"${title}></span>`);
  }
  progressEl.innerHTML = dots.join('');
}

function renderPairButtons(): void {
  const pair = currentPair(state);
  btnVoiced.innerHTML   = `<span class="letter">${pair.voiced.letter}</span><span class="ipa">/${pair.voiced.ipa}/</span>`;
  btnUnvoiced.innerHTML = `<span class="letter">${pair.unvoiced.letter}</span><span class="ipa">/${pair.unvoiced.ipa}/</span>`;
  btnVoiced.className = 'phoneme';
  btnUnvoiced.className = 'phoneme';
  btnVoiced.disabled = false;
  btnUnvoiced.disabled = false;
}

function renderQuestion(): void {
  const entry = currentEntry(state);
  emojiEl.textContent = entry.emoji;
  renderPairButtons();
  revealEl.innerHTML = maskWord(entry.word, entry.highlight);
  hintEl.textContent = '';
  nextBtn.style.visibility = 'hidden';
  scoreEl.textContent = `${state.score} / ${state.total}`;
  renderProgress();
  void speakWord(entry.word);
}

function revealAnswer(): void {
  const entry = currentEntry(state);
  const pair = currentPair(state);
  revealEl.innerHTML = highlightWord(entry.word, entry.highlight);
  // sneaky-spelling hint: when the grapheme differs from the correct side's
  // canonical letter (e.g. raisin → /z/ written "s"), remind the kid.
  const correctLetter = pair[entry.answer].letter;
  hintEl.textContent = entry.highlight !== correctLetter
    ? `ici, « ${entry.highlight} » fait le son « ${correctLetter} »`
    : '';
  nextBtn.style.visibility = 'visible';
  nextBtn.focus();
  // freeze both buttons; mark the picked one
  btnVoiced.disabled = true;
  btnUnvoiced.disabled = true;
}

function onPick(side: Side): void {
  if (!state || isDone(state) || state.answered) return;
  state = pickSide(state, side);
  const picked = side === 'voiced' ? btnVoiced : btnUnvoiced;
  picked.classList.add(state.lastCorrect ? 'correct' : 'wrong');
  scoreEl.textContent = `${state.score} / ${state.total}`;
  renderProgress();
  revealAnswer();
}

function onNext(): void {
  state = advance(state);
  if (isDone(state)) {
    showDone();
  } else {
    renderQuestion();
  }
}

function showDone(): void {
  tts.cancel();
  emojiEl.textContent = '🎉';
  revealEl.textContent = `Bravo ! ${state.score} / ${state.total}`;
  hintEl.textContent = '';
  listenBtn.style.display = 'none';
  btnVoiced.style.display = 'none';
  btnUnvoiced.style.display = 'none';
  nextBtn.style.display = 'none';
  scoreEl.textContent = '';
  renderProgress();
}

async function speakWord(word: string): Promise<void> {
  listenBtn.disabled = true;
  await tts.speak(word);
  listenBtn.disabled = false;
}

btnVoiced.addEventListener('click', () => onPick('voiced'));
btnUnvoiced.addEventListener('click', () => onPick('unvoiced'));
nextBtn.addEventListener('click', onNext);
listenBtn.addEventListener('click', () => {
  if (state && !isDone(state)) void speakWord(currentEntry(state).word);
});

const dataPromise = loadPhonemes('./phonemes.json');
dataPromise.catch((err: unknown) => {
  revealEl.textContent = 'Erreur de chargement.';
  console.error(err);
});

startBtn.addEventListener('click', () => {
  void dataPromise.then(({ entries, pairs }) => {
    state = createGame(entries, pairs);
    startBtn.style.display = 'none';
    listenBtn.style.display = '';
    btnVoiced.style.display = '';
    btnUnvoiced.style.display = '';
    renderQuestion();
  });
});
