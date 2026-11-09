// Build: wrap the ESM source (src/client.js) in the __ModuleLoader__ envelope
// the harness client-module loader requires.
import fs from 'fs';

const src = fs.readFileSync('D:/Workspace/DSH-ChatRtl/src/client.js', 'utf8');

let body = src
  .replace('export const inject = [];', 'const inject = [];')
  .replace('export function apply(ctx) {', 'function apply(ctx) {');

if (/^export\s/m.test(body)) throw new Error('unconverted export remains');

const out = `window.__ModuleLoader__.load({
  id: "dsh-chat-rtl",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${body
  .split('\n')
  .map((l) => (l.trim() === '' ? '' : '    ' + l))
  .join('\n')}
    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});
`;

fs.writeFileSync('D:/Workspace/DSH-ChatRtl/lib/client.js', out);
console.log('built lib/client.js', out.length, 'chars');
