// js/game.js
let wordSet;
let isPracticeMode = false;

async function initGame() {
    wordSet = await loadDictionary();
    const header = document.getElementById('game-header');
    const lettersContainer = document.getElementById('letters-container');
    const wordForm = document.getElementById('word-form');
    const wordInput = document.getElementById('word-input');
    const errorMessage = document.getElementById('error-message');
    const wordList = document.getElementById('word-list');
    const dailyTotal = document.getElementById('daily-total');
    const shareButton = document.getElementById('share-button');
    const replayButton = document.getElementById('replay-button');

    const today = getTodayDate();
    let dailyData = JSON.parse(localStorage.getItem(`game_${today}`)) || { words: [], total: 0, attempts: 0 };
    let letters = generateDailyLetters();
    let lettersSet = new Set(letters);

    function displayLetters() {
        lettersContainer.innerHTML = '';
        letters.forEach(letter => {
            const div = document.createElement('div');
            div.classList.add('letter');
            div.textContent = letter.toUpperCase();
            lettersContainer.appendChild(div);
        });
    }

    displayLetters();

    // Display existing words
    dailyData.words.forEach(({ word, score }) => addWordToList(word, score));
    updateTotal(dailyData.total);

    // Check if max attempts reached
    if (dailyData.attempts >= 10) {
        disableForm();
    }

    wordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        dailyData.attempts++;
        if (!isPracticeMode) saveDailyData(today, dailyData);

        const word = wordInput.value.trim().toLowerCase();
        errorMessage.textContent = '';

        if (dailyData.attempts > 10) {
            errorMessage.textContent = 'Max 10 guesses reached.';
            disableForm();
            return;
        }

        if (!isValidWord(word, lettersSet, wordSet)) {
            errorMessage.textContent = 'Invalid word: Must be 3+ letters, use only given letters, and be a valid English word.';
            wordInput.value = '';
            return;
        }

        if (dailyData.words.some(w => w.word === word)) {
            errorMessage.textContent = 'Word already submitted.';
            dailyData.attempts--; // Count all attempts
            if (!isPracticeMode) saveDailyData(today, dailyData);
            wordInput.value = '';
            return;
        }

        const score = calculateScore(word);
        dailyData.words.push({ word, score });
        dailyData.total += score;
        addWordToList(word, score);
        updateTotal(dailyData.total);
        if (!isPracticeMode) {
            saveDailyData(today, dailyData);
            updateStats(dailyData, today);
        }
        wordInput.value = '';
    });

    shareButton.addEventListener('click', () => {
        const [year, month, day] = today.split('-');
        const shortYear = year.slice(2);
        const text = `wooooordo ${month}/${day}/${shortYear}: ${dailyData.total} points`;
        navigator.clipboard.writeText(text).then(() => {
            alert('Score copied to clipboard!');
        });
    });

    replayButton.addEventListener('click', () => {
        isPracticeMode = true;
        header.querySelector('p').textContent = 'Practice Mode: Form the longest words you can using as few letters as possible. Score: 10 × (length - unique letters). (Scores not saved)';
        dailyData = { words: [], total: 0, attempts: 0 };
        letters = generateRandomLetters();
        lettersSet = new Set(letters);
        displayLetters();
        wordList.innerHTML = '';
        updateTotal(0);
        errorMessage.textContent = '';
        wordInput.disabled = false;
        wordForm.querySelector('button').disabled = false;
        wordInput.focus();
    });

    function addWordToList(word, score) {
        const li = document.createElement('li');
        li.textContent = `${word.toUpperCase()}: ${score} points`;
        li.classList.add('new-word');
        wordList.appendChild(li);
    }

    function updateTotal(total) {
        dailyTotal.textContent = `Daily Total: ${total}`;
    }

    function disableForm() {
        wordInput.disabled = true;
        wordForm.querySelector('button').disabled = true;
        errorMessage.textContent = 'Max 10 guesses reached.';
    }
}

async function loadDictionary() {
    const DICT_KEY = 'wooooordo_dict';
    let dict = localStorage.getItem(DICT_KEY);
    if (dict) {
        return new Set(JSON.parse(dict));
    }
    const url = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';
    const response = await fetch(url);
    const text = await response.text();
    const words = text.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length >= 3);
    const wordSet = new Set(words);
    localStorage.setItem(DICT_KEY, JSON.stringify([...wordSet]));
    return wordSet;
}

document.addEventListener('DOMContentLoaded', initGame);

function saveDailyData(date, data) {
    localStorage.setItem(`game_${date}`, JSON.stringify(data));
}

function updateStats(dailyData, today) {
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

    stats.highScores.push({ ...dailyData.words.slice(-1)[0], date: today });
    stats.highScores.sort((a, b) => b.score - a.score);
    stats.highScores = stats.highScores.slice(0, 10);

    localStorage.setItem('game_stats', JSON.stringify(stats));
}
