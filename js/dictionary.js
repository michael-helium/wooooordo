// js/dictionary.js
let DICT_MEM = null;

export async function loadDictionary() {
  // Already loaded? Just return it
  if (DICT_MEM) return DICT_MEM;

  // ⚡️ Tip: replace this URL with a smaller JSON word list you host yourself
  const url = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';
  const res = await fetch(url, { cache: 'reload' });
  const text = await res.text();

  const words = text
    .split('\n')
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length >= 3);

  DICT_MEM = new Set(words);
  return DICT_MEM;
}
