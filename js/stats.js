// js/stats.js
document.addEventListener('DOMContentLoaded', () => {
    const gamesPlayedEl = document.getElementById('games-played');
    const lifetimePointsEl = document.getElementById('lifetime-points');
    const averageScoreEl = document.getElementById('average-score');
    const currentStreakEl = document.getElementById('current-streak');
    const highScores = document.getElementById('high-scores');

    const stats = JSON.parse(localStorage.getItem('game_stats')) || {
        gamesPlayed: 0,
        lifetimePoints: 0,
        highScores: []
    };

    // Recalculate accurately
    const gameKeys = Object.keys(localStorage).filter(k => k.startsWith('game_'));
    const playedData = gameKeys.map(k => {
        const data = JSON.parse(localStorage.getItem(k));
        return { date: k.split('_')[1], played: data.words.length > 0, total: data.total };
    }).filter(d => d.played);

    stats.gamesPlayed = playedData.length;
    stats.lifetimePoints = playedData.reduce((sum, d) => sum + d.total, 0);

    // Average
    const average = stats.gamesPlayed > 0 ? (stats.lifetimePoints / stats.gamesPlayed).toFixed(2) : 0;

    // Current streak
    const sortedDates = playedData.map(d => d.date).sort();
    let streak = 0;
    if (sortedDates.length > 0) {
        let current = 1;
        for (let i = 1; i < sortedDates.length; i++) {
            const prev = new Date(sortedDates[i-1]);
            const curr = new Date(sortedDates[i]);
            if ((curr - prev) / (1000 * 60 * 60 * 24) === 1) {
                current++;
            } else {
                current = 1;
            }
            streak = Math.max(streak, current);
        }
    }

    localStorage.setItem('game_stats', JSON.stringify(stats));

    gamesPlayedEl.textContent = `Total Games Played: ${stats.gamesPlayed}`;
    lifetimePointsEl.textContent = `Lifetime Points: ${stats.lifetimePoints}`;
    averageScoreEl.textContent = `Average Score: ${average}`;
    currentStreakEl.textContent = `Current Streak: ${streak} days`;

    stats.highScores.forEach(({ word, score, date }) => {
        const li = document.createElement('li');
        li.textContent = `${word.toUpperCase()}: ${score} points (${date})`;
        highScores.appendChild(li);
    });
});
