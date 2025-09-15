// js/game.js
// Use relative imports if game.js is in the same /js folder as daily.js and stats.js
import { todaysLetters, todayKey } from './daily.js';
import { recordGameResult } from './stats.js';

// ---------- Global state ----------
let LETTER_SET = [];
let DICT = null;                    // Set<string> loaded from /dict/dict.json
let submittedWords = new Set();     // words played today
let totalPointsToday = 0;
let bestWord = null;                // { word, score } or null
let playedKey = '';                 // localStorage key for today's save

// Detect dev mode from URL (visit with /?dev=1)
const DEV_MODE = new URLSearchParams(location.search).get('dev') === '1';

// ---------- Utilities ----------
function qs(id) { return document.getElementById(id); }

// Scoring: +10 per letter, -10 per unique letter
function scoreWord(word) {
  const chars = word.toLowerCase().split('');
  const uniques = new Set(chars);
  return 10 * chars.length - 10 * uniques.size;
}

// Load dictionary lazily
async function ensureDict() {
  if (DICT) return;
  // Adjust path if you place dict elsewhere
  const res = await fetch('/dict/dict.json');
  const list = await res.json();
  DICT = new Set(list);
}

// Validate word: length ≥ 3, only today's letters, in dictionary
function isValidWord(word) {
  if (!word || word.length < 3) return false;
  const pool = new Set(LETTER_SET);
  for (const ch of word.toLowerCase()) {
    if (!pool.has(ch)) return false;
  }
  return DICT.has(word.toLowerCase());
}

// ---------- Rendering ----------
function renderLetters(letters) {
  const wrap = qs('letters');
  const dateEl = qs('date');
  if (!wrap) return;

  wrap.innerHTML = '';
  if (dateEl) dateEl.textContent = todayKey();

  letters.forEach((ch) => {
    const btn = document.createElement('button');
    btn.className = 'letter';
    btn.type = 'button';
    btn.textContent = ch.toUpperCase();
    btn.addEventListener('click', () => {
      const input = qs('wordInput');
      if (input) input.value = (input.value || '') + ch;
    });
    wrap.appendChild(btn);
  });

  // backspace button
  const back = document.createElement('button');
  back.className = 'letter utility';
  back.type = 'button';
  back.textContent = '⌫';
  back.addEventListener('click', () => {
    const input = qs('wordInput');
    if (input) input.value = (input.value || '').slice(0, -1);
  });
  wrap.appendChild(back);
}

function updateScoreUI() {
  const el = qs('score');
  if (el) el.textContent = String(totalPointsToday);
}

function renderSubmittedList() {
  const ul = qs('submitted');
  if (!ul) return;
  ul.innerHTML = [...submittedWords]
    .sort((a, b) => scoreWord(b) - scoreWord(a))
    .map((w) => `<li><code>${w}</code> <small>${scoreWord(w)} pts</small></li>`)
    .join('');
}

function toast(msg) {
  const t = qs('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1400);
}

// Save today's progress (used after each valid submit)
function saveToday() {
  localStorage.setItem(playedKey, JSON.stringify({
    totalPointsToday,
    submittedWords: [...submittedWords],
    bestWord
  }));
}

// ---------- Actions ----------
function onSubmit() {
  const input = qs('wordInput');
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
  saveToday();
  if (input) input.value = '';
}

function finishDay() {
  const date = todayKey();
  recordGameResult({ date, points: totalPointsToday, bestWord });
  toast('Saved to stats.');
}

function shareResult() {
  const date = todayKey();
  const best = bestWord ? `${bestWord.word.toUpperCase()}(${bestWord.score})` : '—';
  const text = `Wooooordo ${date}: ${totalPointsToday} pts — best: ${best}`;
  navigator.clipboard?.writeText(text);
  toast('Copied results!');
}

// Wire up UI controls
function wireUI() {
  qs('submitWord')?.addEventListener('click', onSubmit);
  qs('wordInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') onSubmit();
  });
  qs('finishDay')?.addEventListener('click', finishDay);
  qs('shareBtn')?.addEventListener('click', shareResult);
  qs('infoBtn')?.addEventListener('click', () => {
    const d = document.getElementById('infoDialog');
    if (typeof d?.showModal === 'function') d.showModal();
  });
}

// ---------- Init ----------
async function initGame() {
  await ensureDict();

  const date = todayKey();
  playedKey = `wooooordo.played.${date}`;

  // Generate and render today's 5 letters
  LETTER_SET = todaysLetters(date);
  renderLetters(LETTER_SET);

  // ⛔️ Skip loading saved progress when in dev mode (/?dev=1)
  if (!DEV_MODE) {
    const played = JSON.parse(localStorage.getItem(playedKey) || 'null');
    if (played) {
      totalPointsToday = played.totalPointsToday || 0;
      submittedWords = new Set(played.submittedWords || []);
      bestWord = played.bestWord || null;
      updateScoreUI();
      renderSubmittedList();
    }
  } else {
    console.log('[DEV] Skipping saved progress; starting fresh run.');
  }

  wireUI();

  // Register service worker (optional)
  if ('serviceWorker' in navigator) {
    try { navigator.serviceWorker.register('/service-worker.js'); } catch {}
  }
}

document.addEventListener('DOMContentLoaded', initGame);
