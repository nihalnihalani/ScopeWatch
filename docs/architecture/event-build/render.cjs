/* Documentation renderer for the event-build diagrams; not application source.
 * Usage (from repo root): node docs/architecture/event-build/render.cjs <mermaid.min.js> [playwright module]
 * Mermaid pinned to 11.12.0 (cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.min.js); use trusted authored .mmd only.
 * Renders every *.mmd in this folder to SVG and a 2x PNG on a light background. Adds no project dependency.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const mermaidPath = process.argv[2];
assert(mermaidPath, 'Provide the local Mermaid 11.12.0 browser bundle');
const { chromium } = require(process.argv[3] || 'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 2400, height: 1600 }, deviceScaleFactor: 2 });
  await page.setContent('<!doctype html><html><body style="margin:0;background:#fff;font-family:Arial,sans-serif"><main id="d"></main></body></html>');
  await page.addScriptTag({ path: mermaidPath });
  await page.evaluate(() => mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', fontFamily: 'Arial, sans-serif',
    themeVariables: { background: '#ffffff', lineColor: '#44566a', clusterBkg: '#f8fafc', clusterBorder: '#aab6c3', fontSize: '15px' },
    flowchart: { htmlLabels: false, curve: 'basis', nodeSpacing: 30, rankSpacing: 48, padding: 12 } }));
  for (const file of fs.readdirSync(__dirname).filter((f) => f.endsWith('.mmd')).sort()) {
    const slug = path.basename(file, '.mmd');
    const svg = await page.evaluate(async ({ s, id }) => (await mermaid.render(id, s)).svg, { s: fs.readFileSync(path.join(__dirname, file), 'utf8'), id: 'sw-' + slug.replace(/\W/g, '') });
    assert(svg.includes('<svg') && !svg.includes('Syntax error'), file + ' did not render');
    fs.writeFileSync(path.join(__dirname, slug + '.svg'), svg);
    await page.evaluate((s) => { document.getElementById('d').innerHTML = s; const e = document.querySelector('svg'); e.style.maxWidth = 'none'; const b = e.viewBox.baseVal; e.setAttribute('width', Math.ceil(b.width)); e.setAttribute('height', Math.ceil(b.height)); }, svg);
    const dim = await page.locator('svg').evaluate((e) => ({ width: Math.ceil(e.viewBox.baseVal.width), height: Math.ceil(e.viewBox.baseVal.height) }));
    await page.setViewportSize({ width: dim.width + 40, height: dim.height + 40 });
    await page.locator('svg').screenshot({ path: path.join(__dirname, slug + '.png') });
    console.log(slug, dim, '@2x ->', dim.width * 2 + 'x' + dim.height * 2);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
