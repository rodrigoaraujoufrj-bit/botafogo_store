import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const historyPath = new URL('../historico.json', import.meta.url);
const catalogPath = new URL('../catalogo.json', import.meta.url);
const history = process.argv.includes('--seed')
  ? { schema_version: 1, runs: {}, offers: {} }
  : JSON.parse(readFileSync(historyPath, 'utf8'));

function addCatalog(catalog) {
  const run = catalog.run;
  if (!run?.id || !run.at || !Array.isArray(catalog.items)) {
    throw new Error('Catálogo sem rodada válida');
  }
  history.runs[String(run.id)] = run.at;
  for (const item of catalog.items) {
    if (item.run !== run.id || item.stale) continue;
    const key = [item.product, item.sku, item.seller].join('|');
    const point = [run.id, item.price, item.list_price, Boolean(item.available)];
    const series = history.offers[key] ??= [];
    const last = series.at(-1);
    if (last?.[0] === run.id) {
      series.pop();
    } else if (last && last.slice(1).every((value, index) => value === point[index + 1])) {
      continue;
    }
    series.push(point);
  }
}

const latestRun = process.argv.includes('--seed')
  ? 0 : Math.max(0,...Object.keys(history.runs).map(Number));
const commits = execFileSync('git', ['log', '--format=%H', '--', 'catalogo.json'], { encoding: 'utf8' })
  .trim().split('\n');
const pending = [];
for (const commit of commits) {
  const catalog = JSON.parse(execFileSync('git', ['show', `${commit}:catalogo.json`], {
    encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
  }));
  if (catalog.run.id < latestRun) break;
  pending.push(catalog);
}
for (const catalog of pending.reverse()) addCatalog(catalog);
if (!pending.length) {
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  if (catalog.run.id > latestRun) addCatalog(catalog);
}

writeFileSync(historyPath, JSON.stringify(history) + '\n');
console.log(`Histórico: ${Object.keys(history.runs).length} rodadas, ${Object.keys(history.offers).length} ofertas`);
