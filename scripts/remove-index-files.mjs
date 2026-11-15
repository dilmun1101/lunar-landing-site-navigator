// Removes the pass-through index.ts files created by restructure-folders.mjs
// and replaces imports with direct paths:
//   '@/components/ui/Button'  →  '@/components/ui/Button/Button'
// Exports inside the files themselves (Button.tsx, etc.) stay as they are.
//
// Run from the project root:
//   node scripts/remove-index-files.mjs --dry   — only show
//   node scripts/remove-index-files.mjs         — apply
//
// Only index.ts files consisting solely of lines like
//   export { default } from './Name';   /   export * from './Name';
// where "Name" matches the folder name are removed. Other index.ts files (e.g. types/index.ts)
// are left alone. The script is safe to re-run.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src'
);
const dry = process.argv.includes('--dry');

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const toPosix = (p) => p.split(path.sep).join('/');
const aliasOf = (dir) => '@/' + toPosix(path.relative(srcDir, dir));

const allFiles = [...walk(srcDir)];

// 1. Find pass-through index.ts files
const BARREL_LINE = /^export (?:\{ default \}|\*) from '\.\/([\w.-]+)';$/;
const barrels = []; // { file, dir, stem }

for (const file of allFiles) {
  if (path.basename(file) !== 'index.ts') continue;

  const dir = path.dirname(file);
  const lines = fs
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const stems = lines.map((line) => BARREL_LINE.exec(line)?.[1]);
  const isBarrel =
    lines.length > 0 &&
    stems.every((stem) => stem && stem === stems[0]) &&
    stems[0] === path.basename(dir);
  const stem = stems[0];

  const sourceExists =
    isBarrel &&
    ['.ts', '.tsx'].some((ext) => fs.existsSync(path.join(dir, stem + ext)));

  if (sourceExists) barrels.push({ file, dir, stem });
  else console.log(`skipped (not a pass-through): ${toPosix(path.relative(srcDir, file))}`);
}

// 2. Replacement table: '@/folder' → '@/folder/Name'
const replacements = new Map(
  barrels.map(({ dir, stem }) => [aliasOf(dir), `${aliasOf(dir)}/${stem}`])
);

// 3. Rewrite imports (exact match of the quoted string:
//    import, dynamic import(), vi.mock(), etc.)
let changedFiles = 0;
let changedImports = 0;

for (const file of allFiles) {
  if (!/\.(ts|tsx)$/.test(file)) continue;
  // The pass-through files themselves are removed below; their content is not edited
  if (barrels.some((barrel) => barrel.file === file)) continue;

  const original = fs.readFileSync(file, 'utf8');
  let count = 0;
  const updated = original.replace(
    /(['"])(@\/[^'"]+)\1/g,
    (match, quote, specifier) => {
      const next = replacements.get(specifier);
      if (!next) return match;
      count++;
      return `${quote}${next}${quote}`;
    }
  );

  if (count > 0) {
    console.log(
      `imports (${count}): ${toPosix(path.relative(srcDir, file))}`
    );
    changedFiles++;
    changedImports += count;
    if (!dry) fs.writeFileSync(file, updated);
  }
}

// 4. Remove pass-through files
for (const { file } of barrels) {
  console.log(`removing: ${toPosix(path.relative(srcDir, file))}`);
  if (!dry) fs.unlinkSync(file);
}

console.log(
  `\n${dry ? 'Would change' : 'Changed'}: ${changedImports} imports in ${changedFiles} files; ` +
    `${dry ? 'would remove' : 'removed'} index.ts: ${barrels.length}`
);
