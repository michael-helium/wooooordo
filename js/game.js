// js/game.js
let wordSet;

async function initGame() {
    wordSet = await loadDictionary();
    const lettersContainer = document.getElementById('letters-container');
    const wordForm = document.getElementById('word-form');
    const wordInput = document.getElementById('word-input');
    const errorMessage = document.getElementById('error-message');
    const wordList = document.getElementById('word-list');
    const dailyTotal = document.getElementById('daily-total');

    const today = getTodayDate();
    let dailyData = JSON.parse(localStorage.getItem(`game_${today}`)) || { words: [], total: 0 };
    const letters = generateDailyLetters();
    const lettersSet = new Set(letters);

    // Display letters
    letters.forEach(letter => {
        const div = document.createElement('div');
        div.classList.add('letter');
        div.textContent = letter.toUpperCase();
        lettersContainer.appendChild(div);
    });

    // Display existing words
    dailyData.words.forEach(({ word, score }) => addWordToList(word, score));
    updateTotal(dailyData.total);

    wordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const word = wordInput.value.trim().toLowerCase();
        errorMessage.textContent = '';

        if (!isValidWord(word, lettersSet, wordSet)) {
            errorMessage.textContent = 'Invalid word: Must be 3+ letters, use only given letters, and be a valid English word.';
            return;
        }

        if (dailyData.words.some(w => w.word === word)) {
            errorMessage.textContent = 'Word already submitted today.';
            return;
        }

        const score = calculateScore(word);
        dailyData.words.push({ word, score });
        dailyData.total += score;
        addWordToList(word, score);
        updateTotal(dailyData.total);
        saveDailyData(today, dailyData);
        updateStats(dailyData);
        wordInput.value = '';
    });

    function addWordToList(word, score) {
        const li = document.createElement('li');
        li.textContent = `${word.toUpperCase()}: ${score} points`;
        wordList.appendChild(li);
    }

    function updateTotal(total) {
        dailyTotal.textContent = `Daily Total: ${total}`;
    }
}

async function loadDictionary() {
    const url = 'https://raw.githubusercontent.com/scrabblewords/scrabblewords/main/words/North-American/NWL2020.txt';
    const response = await fetch(url);
    const text = await response.text();
    const words = text.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length >= 3);
    return new Set(words);
}

document.addEventListener('DOMContentLoaded', initGame);

// Other functions unchanged (saveDailyData, updateStats)
function saveDailyData(date, data) {
    localStorage.setItem(`game_${date}`, JSON.stringify(data));
}

function updateStats(dailyData) {
    let stats = JSON.parse(localStorage.getItem('game_stats')) || {
        gamesPlayed: 0,
        lifetimePoints: 0,
        highScores: []
    };

    if (dailyData.words.length > 0) {
        const playedDays = new Set(Object.keys(localStorage).filter(k => k.startsWith('game_')).map(k => k.split('_')[1]));
        stats.gamesPlayed = playedDays.size;
    }

    stats.lifetimePoints += dailyData.words[dailyData.words.length - 1].score;

    stats.highScores.push(...dailyData.words.slice(-1));
    stats.highScores.sort((a, b) => b.score - a.score);
    stats.highScores = stats.highScores.slice(0, 10);

    localStorage.setItem('game_stats', JSON.stringify(stats));
}
