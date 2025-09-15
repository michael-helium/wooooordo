// daily.js

// Pacific Time rollover (America/Los_Angeles)
function todayPacificISO() {
  // Use local device TZ (assume user base in Pacific). If you want *true* PT,
// run this on server or ship luxon/timezone data later.
  const d = new Date();
  // normalize to yyyy-mm-dd
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Deterministic seed from date string
function seedFromDate(dateStr) {
  return dateStr.split('-').reduce((acc, part) => acc * 1009 + parseInt(part, 10), 1);
}

// Tiny seeded RNG
function mulberry32(a) {
  return function() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Frequency-biased pool to avoid 5 weird letters
const LETTERS =
  'eeeeeeeeeeeeeeeeeeettttttttttaaaaaaaaaaooooooooiiiiiiiinnnnnnnnrrrrrrrrsssssssshhhhhhhlllllluddddcccmffppgwybvkxjqz';

export function todaysLetters(dateStr = todayPacificISO()) {
  const rng = mulberry32(seedFromDate(dateStr));
  const set = new Set();
  while (set.size < 5) {
    const ch = LETTERS[Math.floor(rng() * LETTERS.length)];
    set.add(ch);
  }
  return Array.from(set);
}

export function todayKey() {
  return todayPacificISO(); // used as storage key for today’s results
}
