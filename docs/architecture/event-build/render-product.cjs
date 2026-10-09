/* Documentation renderer for the product architecture SVGs; not application source.
 * Usage (from repo root): node docs/architecture/event-build/render-product.cjs [playwright module]
 * Renders scopewatch-product-architecture{,-dark}.svg to a 2x PNG. Adds no project dependency.
 */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.argv[2] || 'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const slug of ['scopewatch-product-architecture', 'scopewatch-product-architecture-dark']) {
    const svg = fs.readFileSync(path.join(__dirname, slug + '.svg'), 'utf8');
    const m = /viewBox="0 0 (\d+) (\d+)"/.exec(svg);
    const width = Number(m[1]);
    const height = Number(m[2]);
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
    await page.setContent('<!doctype html><html><body style="margin:0">' + svg + '</body></html>');
    await page.screenshot({ path: path.join(__dirname, slug + '.png'), clip: { x: 0, y: 0, width, height } });
    await page.close();
    console.log(slug, width + 'x' + height, '@2x ->', width * 2 + 'x' + height * 2);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
