// js/stats.js
// Updated to recalculate accurately on load (unchanged otherwise)
document.addEventListener('DOMContentLoaded', () => {
    const gamesPlayed = document.getElementById('games-played');
    const lifetimePoints = document.getElementById('lifetime-points');
    const highScores = document.getElementById('high-scores');

    const stats = JSON.parse(localStorage.getItem('game_stats')) || {
        gamesPlayed: 0,
        lifetimePoints: 0,
        highScores: []
    };

    const playedDays = Object.keys(localStorage)
        .filter(k => k.startsWith('game_'))
        .map(k => {
            const data = JSON.parse(localStorage.getItem(k));
            return data.words.length > 0 ? 1 : 0;
        })
        .reduce((a, b) => a + b, 0);
    stats.gamesPlayed = playedDays;

    stats.lifetimePoints = Object.keys(localStorage)
        .filter(k => k.startsWith('game_'))
        .reduce((total, k) => {
            const data = JSON.parse(localStorage.getItem(k));
            return total + data.total;
        }, 0);

    localStorage.setItem('game_stats', JSON.stringify(stats));

    gamesPlayed.textContent = `Total Games Played: ${stats.gamesPlayed}`;
    lifetimePoints.textContent = `Lifetime Points: ${stats.lifetimePoints}`;

    stats.highScores.forEach(({ word, score }) => {
        const li = document.createElement('li');
        li.textContent = `${word.toUpperCase()}: ${score} points`;
        highScores.appendChild(li);
    });
});
