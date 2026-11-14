// Убирает файлы-«проводники» index.ts, которые создал restructure-folders.mjs,
// и заменяет импорты на прямые пути:
//   '@/components/ui/Button'  →  '@/components/ui/Button/Button'
// Экспорты внутри самих файлов (Button.tsx и т.д.) остаются как есть.
//
// Запуск из корня проекта:
//   node scripts/remove-index-files.mjs --dry   — только показать
//   node scripts/remove-index-files.mjs         — выполнить
//
// Удаляются только index.ts, состоящие из одних строк вида
//   export { default } from './Имя';   /   export * from './Имя';
// где «Имя» совпадает с названием папки. Остальные index.ts (например types/index.ts)
// не трогаются. Скрипт безопасно запускать повторно.

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

// 1. Ищем index.ts-проводники
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
  else console.log(`пропуск (не проводник): ${toPosix(path.relative(srcDir, file))}`);
}

// 2. Таблица замен: '@/папка' → '@/папка/Имя'
const replacements = new Map(
  barrels.map(({ dir, stem }) => [aliasOf(dir), `${aliasOf(dir)}/${stem}`])
);

// 3. Переписываем импорты (точное совпадение строки в кавычках:
//    import, динамический import(), vi.mock() и т.п.)
let changedFiles = 0;
let changedImports = 0;

for (const file of allFiles) {
  if (!/\.(ts|tsx)$/.test(file)) continue;
  // Сами проводники удаляем ниже, их содержимое не правим
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
      `импорты (${count}): ${toPosix(path.relative(srcDir, file))}`
    );
    changedFiles++;
    changedImports += count;
    if (!dry) fs.writeFileSync(file, updated);
  }
}

// 4. Удаляем проводники
for (const { file } of barrels) {
  console.log(`удаление: ${toPosix(path.relative(srcDir, file))}`);
  if (!dry) fs.unlinkSync(file);
}

console.log(
  `\n${dry ? 'Будет изменено' : 'Изменено'}: импортов ${changedImports} в ${changedFiles} файлах; ` +
    `${dry ? 'будет удалено' : 'удалено'} index.ts: ${barrels.length}`
);
