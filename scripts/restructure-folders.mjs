// Раскладывает каждый модуль в свою папку:
//   Button.tsx  →  Button/Button.tsx + Button/index.ts
// Тесты (X.test.ts[x] / X.spec.ts[x]) переезжают вместе с модулем.
// Импорты менять не нужно: `@/components/ui/Button` теперь ведёт на Button/index.ts.
//
// Запуск из корня проекта:
//   node scripts/restructure-folders.mjs          — выполнить
//   node scripts/restructure-folders.mjs --dry    — только показать, что будет сделано
//
// Скрипт безопасно запускать повторно: уже разложенные модули пропускаются.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src'
);
const dry = process.argv.includes('--dry');

// Что раскладываем
const ROOT_DIRS = [
  'components',
  'features',
  'layouts',
  'pages',
  'hooks',
  'state',
  'lib',
  'domain',
];
const ROOT_FILES = ['App.tsx'];
// Данные и типы остаются как есть (main.tsx, router.tsx, i18n, styles — вне списка)
const EXCLUDE = new Set(['siteCatalog.ts', 'types.ts']);

const TEST_SUFFIXES = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'];

const isModule = (name) =>
  /\.(ts|tsx)$/.test(name) &&
  !/\.(test|spec)\.(ts|tsx)$/.test(name) &&
  name !== 'index.ts' &&
  !EXCLUDE.has(name);

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const rel = (p) => path.relative(path.dirname(srcDir), p).replaceAll('\\', '/');

const files = [
  ...ROOT_DIRS.flatMap((d) => [...walk(path.join(srcDir, d))]),
  ...ROOT_FILES.map((f) => path.join(srcDir, f)).filter(fs.existsSync),
].filter((file) => isModule(path.basename(file)));

let moved = 0;
let skipped = 0;

for (const file of files) {
  const dir = path.dirname(file);
  const name = path.basename(file);
  const stem = name.replace(/\.(ts|tsx)$/, '');

  // уже лежит в папке с тем же именем
  if (path.basename(dir) === stem) {
    skipped++;
    continue;
  }

  const target = path.join(dir, stem);
  if (fs.existsSync(target)) {
    console.warn(`пропуск (папка уже есть): ${rel(target)}`);
    skipped++;
    continue;
  }

  const text = fs.readFileSync(file, 'utf8');
  const hasDefault = /^export\s+default\b/m.test(text);
  const hasNamed = /^export\s+(?!default\b)/m.test(text);
  const indexLines = [];
  if (hasDefault) indexLines.push(`export { default } from './${stem}';`);
  if (hasNamed || !hasDefault) indexLines.push(`export * from './${stem}';`);

  const companions = TEST_SUFFIXES.map((suffix) => stem + suffix).filter(
    (testName) => fs.existsSync(path.join(dir, testName))
  );

  console.log(
    `${rel(file)}  →  ${rel(path.join(target, name))}` +
      (companions.length ? `  (+ ${companions.join(', ')})` : '')
  );

  if (!dry) {
    fs.mkdirSync(target);
    fs.renameSync(file, path.join(target, name));
    for (const testName of companions) {
      fs.renameSync(path.join(dir, testName), path.join(target, testName));
    }
    fs.writeFileSync(
      path.join(target, 'index.ts'),
      indexLines.join('\n') + '\n'
    );
  }
  moved++;
}

console.log(
  `\n${dry ? 'Будет перенесено' : 'Перенесено'}: ${moved}, пропущено: ${skipped}`
);
