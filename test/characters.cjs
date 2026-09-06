const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const start = html.indexOf('const translations =');
const end = html.indexOf('// Default preview text', html.indexOf('const ALL_CHARS ='));
const { translations, chars } = vm.runInNewContext(html.slice(start, end) + '; ({ translations, chars: ALL_CHARS })');
assert.equal(chars.length, new Set(chars).size, 'font export must not contain duplicate characters');
for (const translation of Object.values(translations)) {
  const localized = Object.values(translation.charSets).flat();
  assert.equal(localized[0], '©', 'copyright must be the first visible character in every language');
  assert.deepEqual(Array.from(localized), Array.from(chars), 'language switching must preserve the exact character set');
}
for (const char of Array.from('©®™♡♥☆★ω꒳ᵕʕʔฅ٩وᗜ◕‿')) assert(chars.includes(char), `missing ${char}`);
for (const char of 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') assert(chars.includes(char));
for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
  if (!script[1].includes('src=') && !script[1].includes('type="module"') && !script[1].includes('type="importmap"')) new vm.Script(script[2]);
}
console.log(`PASS: ${chars.length} unique characters, three matching languages, required symbols and script syntax`);
