// js/utils.js
function getTodayDate() {
    return '2025-09-15'; // Mock for September 15, 2025; remove or comment out for real use: return new Date().toISOString().split('T')[0];
}

function seededRandom(seed) {
    let x = seed % 0xFFFFFFFF;
    return () => {
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        return (x >>> 0) / 0xFFFFFFFF;
    };
}

function getDailySeed() {
    const date = getTodayDate();
    return date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function generateDailyLetters() {
    const rand = seededRandom(getDailySeed());
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const vowels = new Set('aeiou');
    let letters, vowelCount;
    do {
        letters = new Set();
        while (letters.size < 5) {
            letters.add(alphabet[Math.floor(rand() * 26)]);
        }
        vowelCount = [...letters].filter(l => vowels.has(l)).length;
    } while (vowelCount < 1 || vowelCount > 3);
    return [...letters].sort();
}

function isValidWord(word, lettersSet, wordSet) {
    if (word.length < 3) return false;
    if (!wordSet.has(word)) return false;
    return [...word].every(char => lettersSet.has(char));
}

function calculateScore(word) {
    const length = word.length;
    const uniqueLetters = new Set(word).size;
    return 10 * (length - uniqueLetters);
}
