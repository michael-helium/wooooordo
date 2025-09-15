// stats.js
const STATS_KEY = 'wooooordo.stats.v1';

export function loadStats() {
  const raw = localStorage.getItem(STATS_KEY);
  return raw ? JSON.parse(raw) : {
    totalGames: 0,
    lifetimePoints: 0,
    bestWords: [], // {word, score, date}
    history: []    // {date, points}
  };
}

export function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordGameResult({ date, points, bestWord }) {
  const stats = loadStats();
  stats.totalGames += 1;
  stats.lifetimePoints += points;
  stats.history.push({ date, points });

  if (bestWord) {
    stats.bestWords.push({ word: bestWord.word, score: bestWord.score, date });
    // keep only top 20 by score
    stats.bestWords.sort((a,b) => b.score - a.score);
    stats.bestWords = stats.bestWords.slice(0, 20);
  }
  saveStats(stats);
}

export function renderStatsPage() {
  const s = loadStats();
  const el = (id) => document.getElementById(id);

  if (el('totalGames')) el('totalGames').textContent = s.totalGames.toString();
  if (el('lifetimePoints')) el('lifetimePoints').textContent = s.lifetimePoints.toString();

  if (el('bestWords')) {
    el('bestWords').innerHTML = s.bestWords
      .map(({word, score, date}) => `<li><strong>${word}</strong> — ${score} pts <small>${date}</small></li>`)
      .join('');
  }
}
