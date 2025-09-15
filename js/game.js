// game.js
import { todaysLetters, todayKey } from './daily.js';
import { loadStats, recordGameResult } from './stats.js';

let LETTER_SET = [];
let DICT = null;          // Set<string>
let submittedWords = new Set(); // to prevent duplicates
let totalPointsToday = 0;
let bestWord = null;

// 1) Scoring
function scoreWord(word) {
  const chars = word.toLowerCase().split('');
  const uniques = new Set(chars);
  return 10 * chars.length - 10 * uniques.size;
}

// 2) Load dictionary lazily
async function ensureDict() {
  if (DICT) return;
  const res = await fetch('/dict/dict.json'); // host at /dict
  const list = await res.json();
  DICT = new Set(list);
}

// 3) Validation with today’s letters only
function isValidWord(word) {
  if (!word || word.length < 3) return false;
  const pool = new Set(LETTER_SET);
  for (const ch of word.toLowerCase()) {
    if (!pool.has(ch)) return false;
  }
  return DICT.has(word.toLowerCase());
}

// 4) Initialize today
async function initGame() {
  await ensureDict();
  const date = todayKey();

  LETTER_SET = todaysLetters(date);
  renderLetters(LETTER_SET);

  // prevent replaying the same day (optional)
  const playedKey = `wooooordo.played.${date}`;
  const played = JSON.parse(localStorage.getItem(playedKey) || 'null');
  if (played) {
    totalPointsToday = played.totalPointsToday || 0;
    submittedWords = new Set(played.submittedWords || []);
    bestWord = played.bestWord || null;
    updateScoreUI();
    renderSubmittedList();
  }

  wireUI(playedKey, date);
}

function renderLetters(letters) {
  // build your on-screen keyboard from letters
  // ...
}

function updateScoreUI() {
  const el = document.getElementById('score');
  if (el) el.textContent = `${totalPointsToday}`;
}

function renderSubmittedList() {
  const ul = document.getElementById('submitted');
  if (!ul) return;
  ul.innerHTML = [...submittedWords]
    .map(w => `<li>${w} <small>${scoreWord(w)} pts</small></li>`)
    .join('');
}

function saveToday(playedKey) {
  localStorage.setItem(playedKey, JSON.stringify({
    totalPointsToday,
    submittedWords: [...submittedWords],
    bestWord
  }));
}

function wireUI(playedKey, date) {
  const input = document.getElementById('wordInput');
  const submit = document.getElementById('submitWord');

  submit?.addEventListener('click', () => onSubmit(input, playedKey, date));
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') onSubmit(input, playedKey, date);
  });

  // also wire on-screen letter buttons to append to input.value
}

function onSubmit(input, playedKey, date) {
  const raw = (input?.value || '').trim();
  const word = raw.toLowerCase();
  if (!word) return;

  if (submittedWords.has(word)) {
    toast('Already submitted.');
    return;
  }
  if (!isValidWord(word)) {
    toast('Not valid.');
    return;
  }

  const s = scoreWord(word);
  submittedWords.add(word);
  totalPointsToday += s;

  if (!bestWord || s > bestWord.score) {
    bestWord = { word, score: s };
  }

  updateScoreUI();
  renderSubmittedList();
  saveToday(playedKey);
  input.value = '';
}

function toast(msg) {
  // simple inline message or a small floating toast
  const el = document.getElementById('msg');
  if (el) {
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1200);
  }
}

// 5) End-of-day finalize (e.g., when user taps "Finish")
function finishDay() {
  const date = todayKey();
  recordGameResult({
    date,
    points: totalPointsToday,
    bestWord
  });
  shareResult(); // optional
}

function shareResult() {
  const date = todayKey();
  const best = bestWord ? `${bestWord.word.toUpperCase()}(${bestWord.score})` : '—';
  const text = `Wooooordo ${date}: ${totalPointsToday} pts — best: ${best}`;
  navigator.clipboard?.writeText(text);
  toast('Copied results!');
}

document.addEventListener('DOMContentLoaded', initGame);
