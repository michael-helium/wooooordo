// js/utils.js
const FORCE_LETTERS = ['a','e','r','l','n']; // e.g. ['x','y','z','x','x'] for testing or = null for live.


function getTodayDate() {
    return '2025-09-15'; // Mock; remove for production: return new Date().toISOString().split('T')[0];
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
    if (FORCE_LETTERS) return FORCE_LETTERS;
    const rand = seededRandom(getDailySeed());
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const vowels = new Set('aeiou');
    // Frequencies from English letter freq (approx % * 100 for weights)
    const frequencies = {
        a: 812, b: 149, c: 271, d: 432, e: 1202, f: 230, g: 203, h: 592, i: 731, j: 10, k: 69, l: 398, m: 261,
        n: 695, o: 768, p: 182, q: 11, r: 602, s: 628, t: 910, u: 288, v: 111, w: 209, x: 17, y: 211, z: 7
    };
    const totalWeight = Object.values(frequencies).reduce((sum, w) => sum + w, 0);

    function weightedRandomLetter() {
        const r = rand() * totalWeight;
        let sum = 0;
        for (let i = 0; i < alphabet.length; i++) {
            sum += frequencies[alphabet[i]];
            if (r <= sum) return alphabet[i];
        }
        return alphabet[alphabet.length - 1]; // Fallback
    }

    let letters, vowelCount;
    do {
        letters = new Set();
        while (letters.size < 5) {
            letters.add(weightedRandomLetter());
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
