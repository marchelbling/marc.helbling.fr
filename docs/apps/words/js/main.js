import { TTS } from './tts.js';
import { loadWords } from './data.js';
import { createGame, checkAnswer, getDisplay, advance, addScore, isDone } from './game.js';
const tts = new TTS();
let state;
let answerEl = null;
const wordEl = document.querySelector('#word');
const scoreEl = document.querySelector('#score');
const listenBtn = document.querySelector('#listen');
const submitBtn = document.querySelector('#submit');
function measureTextWidth(text) {
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;';
    const cs = window.getComputedStyle(wordEl);
    probe.style.fontFamily = cs.fontFamily;
    probe.style.fontSize = cs.fontSize;
    probe.style.fontWeight = cs.fontWeight;
    probe.style.letterSpacing = cs.letterSpacing;
    probe.textContent = text;
    document.body.appendChild(probe);
    const w = probe.getBoundingClientRect().width;
    document.body.removeChild(probe);
    return w;
}
function renderWord() {
    const entry = state.entries[state.index];
    const display = getDisplay(state);
    const missingLen = entry.missing.length;
    const missingWidth = measureTextWidth(entry.missing);
    // Build inline HTML: replace the underscore run with an inline input
    const inputHTML = `<input id="answer" type="text"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
        maxlength="${missingLen + 2}"
        style="width:${missingWidth + 8}px" />`;
    wordEl.innerHTML = display.replace(/_+/, inputHTML);
    answerEl = document.querySelector('#answer');
    answerEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSubmit(); });
    scoreEl.textContent = `${state.score} / ${state.total}`;
    answerEl.focus();
    tts.speak(entry.word);
}
function onCorrect() {
    state = addScore(state);
    answerEl.className = 'correct';
    answerEl.disabled = true;
    scoreEl.textContent = `${state.score} / ${state.total}`;
    setTimeout(() => {
        state = advance(state);
        if (isDone(state)) {
            showDone();
        }
        else {
            renderWord();
        }
    }, 1500);
}
function onWrong() {
    answerEl.classList.remove('wrong');
    void answerEl.offsetWidth; // force reflow to restart animation
    answerEl.classList.add('wrong');
    answerEl.select();
}
function showDone() {
    tts.cancel();
    wordEl.textContent = `Bravo ! ${state.score} / ${state.total}`;
    submitBtn.style.display = 'none';
    listenBtn.style.display = 'none';
    scoreEl.textContent = '';
}
function handleSubmit() {
    if (!answerEl || isDone(state) || answerEl.classList.contains('correct'))
        return;
    if (checkAnswer(state.entries[state.index], answerEl.value)) {
        onCorrect();
    }
    else {
        onWrong();
    }
}
submitBtn.addEventListener('click', handleSubmit);
listenBtn.addEventListener('click', () => {
    if (!isDone(state))
        tts.speak(state.entries[state.index].word);
});
loadWords('./words.json').then(entries => {
    state = createGame(entries);
    renderWord();
}).catch((err) => {
    wordEl.textContent = 'Erreur de chargement.';
    console.error(err);
});
