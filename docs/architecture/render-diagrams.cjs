/* Documentation renderer only; this is not the event application's source.
 * Usage: node render-diagrams.cjs <mermaid.min.js> <playwright module path>
 * Mermaid pinned for this artifact to 11.12.0; use trusted authored .mmd only.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const mermaidPath = process.argv[2];
const playwrightPath = process.argv[3] || 'playwright';
assert(mermaidPath, 'Provide the locally available Mermaid browser bundle');
const { chromium } = require(playwrightPath);
const diagramDir = path.join(__dirname, 'diagrams');
const outDir = path.join(__dirname, 'rendered');
fs.mkdirSync(outDir, { recursive: true });
const descriptions = {
  '01-system': ['System / trust boundaries', 'Complete proposed path: lower-trust synthetic tickets, Guild-mediated credential use, trusted collection, exact ClickHouse evidence, contextual investigation, human native policy action and fresh effect verification. Separate development/research lanes never authorize runtime actions.'],
  '02-sequence': ['Execution / evidence / action', 'Exact order of calls and observations. Durable evidence follows completed turns; generation readback precedes case admission. Native policy action is human UI or separately verified CLI. Both actual fresh outcomes are required.'],
  '03-evidence': ['Evidence admission / analytics', 'Canonicalize all source versions before actor, decision or time filters. Missing coverage and equal-ID conflicts never become compliant zero. Publish an immutable generation, verify readback, then calculate current and historical witnesses.'],
  '04-identity': ['Native identity / credential scope', 'Actual acting subject is proven through native event/task relationships, not copied from a root label. Credential resolver mode, grants and operation names are preflight gates. Both workloads must actually evaluate the same credential.'],
  '05-action-state': ['Action / recovery states', 'Approval, observed native action and verified effect are distinct. Recovery has its own target-and-control success predicate. New integrity disputes preserve past effect receipts and require review; no automatic policy removal.'],
  '06-deployment': ['Deployment / secrets / permissions', 'One local backend and SQLite control journal; ClickHouse provides analytical evidence, Guild hosts agents, GitHub contains owned fixtures. Loopback operator interface and sanitized read-only export keep sponsor keys outside the browser and model.'],
  '07-claims-and-sponsors': ['Proof / sponsor contribution', 'Native controlled case and labeled replay are separate. ClickHouse selects from actual evidence; Guild runs useful hosted work; Semgrep needs an authentic finding. Optional prompt influence requires a matched control. Pi has no runtime access dependency.']
};
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:2600,height:1800},deviceScaleFactor:1});
  await page.setContent('<!doctype html><html><body style="margin:0;background:white;font-family:Arial,sans-serif"><main id="diagram"></main></body></html>');
  await page.addScriptTag({path:mermaidPath});
  await page.evaluate(() => mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:'base',fontFamily:'Arial, sans-serif',themeVariables:{primaryColor:'#f0f5fa',primaryTextColor:'#21364c',primaryBorderColor:'#63798e',lineColor:'#63798e',secondaryColor:'#eaf6f1',tertiaryColor:'#fbfcfe',background:'#ffffff',clusterBkg:'#f7f9fc',clusterBorder:'#b6c3cf',fontSize:'16px'},flowchart:{htmlLabels:false,curve:'basis',nodeSpacing:28,rankSpacing:42,padding:14},sequence:{useMaxWidth:false,wrap:true,actorMargin:35,messageMargin:32},state:{useMaxWidth:false}}));
  const files=fs.readdirSync(diagramDir).filter(x=>x.endsWith('.mmd')).sort();
  const diagrams=[];
  for(const [i,file] of files.entries()) {
    const source=fs.readFileSync(path.join(diagramDir,file),'utf8');
    const svg=await page.evaluate(async ({source,id}) => (await mermaid.render(id,source)).svg, {source,id:'scopewatch-'+i});
    assert(svg.includes('<svg'),file+' did not render');
    const slug=path.basename(file,'.mmd');
    fs.writeFileSync(path.join(outDir,slug+'.svg'),svg);
    await page.evaluate(svg => {document.getElementById('diagram').innerHTML=svg; const el=document.querySelector('svg'); el.style.maxWidth='none'; const box=el.viewBox.baseVal; el.setAttribute('width',String(Math.ceil(box.width)));el.setAttribute('height',String(Math.ceil(box.height)));},svg);
    const dimensions=await page.locator('svg').evaluate(el=>({width:Math.ceil(el.viewBox.baseVal.width),height:Math.ceil(el.viewBox.baseVal.height)}));
    await page.setViewportSize({width:Math.max(1000,dimensions.width+40),height:Math.max(800,dimensions.height+40)});
    await page.locator('svg').screenshot({path:path.join(outDir,slug+'.png')});
    diagrams.push({slug,file,svg,title:descriptions[slug][0],description:descriptions[slug][1],...dimensions});
  }
  const payload=JSON.stringify(diagrams.map(({svg,...x})=>x));
  const panels=diagrams.map((d,i)=>`<section class="panel" id="panel-${i}" ${i?'hidden':''}><div class="canvas">${d.svg}</div></section>`).join('');
  const buttons=diagrams.map((d,i)=>`<button type="button" data-tab="${i}" aria-pressed="${!i}"><span>${String(i+1).padStart(2,'0')}</span>${escapeHtml(d.title)}</button>`).join('');
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ScopeWatch · architecture atlas</title><style>
*{box-sizing:border-box}body{margin:0;background:#edf2f7;color:#173149;font-family:Arial,sans-serif}header{background:#112d42;color:#fff;padding:25px 30px;display:flex;justify-content:space-between;gap:24px;align-items:center}h1{font-size:27px;margin:5px 0}header p{margin:0;color:#bcd0dd;font-size:14px;max-width:840px;line-height:1.5}.kicker{font-size:11px;letter-spacing:2px;color:#73d1b1;text-transform:uppercase}.status{font-size:12px;border:1px solid #738a99;padding:9px 11px;white-space:nowrap;border-radius:5px}.layout{display:grid;grid-template-columns:255px 1fr;min-height:calc(100vh - 127px)}nav{padding:22px 12px;border-right:1px solid #cdd8e3;background:#f7f9fc}nav button{width:100%;text-align:left;border:0;background:transparent;color:#294861;padding:13px 10px;margin:3px 0;font-size:13px;line-height:1.4;border-radius:6px;cursor:pointer}nav button span{display:inline-block;font-size:11px;color:#6d879d;margin-right:9px}nav button[aria-pressed=true]{background:#dcecf5;color:#103f5b;font-weight:bold}nav p{font-size:12px;line-height:1.55;color:#627c91;padding:14px 10px}main{min-width:0;padding:22px 26px}.top{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:12px}.top h2{font-size:21px;margin:0}.tools{display:flex;gap:7px;flex-wrap:wrap}.tools button,.tools a{font:12px Arial,sans-serif;color:#204762;text-decoration:none;background:white;border:1px solid #c3d2df;padding:8px 10px;border-radius:4px;cursor:pointer}.description{font-size:14px;line-height:1.55;max-width:1100px;color:#4a657c;margin:0 0 17px}.viewport{height:66vh;min-height:450px;overflow:auto;border:1px solid #c3d2df;border-radius:8px;background:white;position:relative}.panel{padding:24px;min-width:100%;min-height:100%}.panel[hidden]{display:none}.canvas{transform-origin:top left}.canvas svg{max-width:none!important;display:block}.legend{display:flex;gap:20px;flex-wrap:wrap;font-size:11px;color:#506c82;margin:15px 0}.legend i{display:inline-block;width:12px;height:12px;border-radius:2px;vertical-align:middle;margin-right:6px}.note{font-size:12px;line-height:1.55;color:#526f84;border-top:1px solid #c8d6e2;padding-top:12px}.footerlinks{font-size:12px;margin-top:15px;display:flex;gap:20px}.footerlinks a{color:#235c7f}@media(max-width:850px){header{display:block}.status{display:inline-block;margin-top:12px}.layout{display:block}nav{display:flex;overflow:auto;padding:10px}nav button{min-width:170px}nav p{display:none}main{padding:15px}.top{display:block}.tools{margin-top:10px}.viewport{height:65vh}}
</style></head><body><header><div><div class="kicker">ScopeWatch / Cyberdefense Hackathon</div><h1>Evidence → decision → verified restriction</h1><p>Seven coordinated views of one proposed architecture. Native permission evidence, deterministic approval authority and actual operation results remain distinct.</p></div><div class="status">DESIGN · ACCOUNT GATES UNTESTED</div></header><div class="layout"><nav aria-label="Architecture views">${buttons}<p>Solid lines: proposed live path.<br>Dashed lines: optional, replay or research.<br><br>Drag scrollbars or use your trackpad to explore. Fit / zoom work offline.</p></nav><main><div class="top"><h2 id="view-title"></h2><div class="tools"><button id="fit">Fit</button><button id="minus">−</button><button id="plus">+</button><button id="actual">100%</button><a id="svg-link" download>SVG</a><a id="png-link" download>PNG</a><a id="source-link">Mermaid source</a></div></div><p class="description" id="description"></p><div class="viewport" id="viewport">${panels}</div><div class="legend"><span><i style="background:#eaf6f1;border:1px solid #28785e"></i>Trusted controller / journal</span><span><i style="background:#f1edfc;border:1px solid #7252ad"></i>Native Guild</span><span><i style="background:#eaf3ff;border:1px solid #4375ae"></i>ClickHouse analytics</span><span><i style="background:#fff4db;border:1px solid #aa7b29"></i>Human review / effect</span><span>All views describe design, not completed runtime tests.</span></div><p class="note">ALLOW means a native permission approval. It does not prove a successful read. Durable source visibility can follow turn completion. Native policy application uses the operator's actual UI or verified CLI; a policy mutation REST endpoint is not assumed. Fresh target/control probes verify only the observed matching operations and time.</p><div class="footerlinks"><a href="ARCHITECTURE.md">Detailed architecture</a><a href="ARCHITECTURE_REVIEW.md">Devil's advocate review</a><a href="GUILD_CONTRACTS.md">Guild contracts</a><a href="CLICKHOUSE_CONTRACTS.md">ClickHouse contracts</a></div></main></div><script>
const diagrams=${payload};let selected=0,scale=1;const viewport=document.getElementById('viewport');
function zoom(next){scale=Math.max(.12,Math.min(3,next));const canvas=document.querySelector('#panel-'+selected+' .canvas');canvas.style.zoom=String(scale);}
function fit(){const d=diagrams[selected];zoom(Math.min((viewport.clientWidth-52)/d.width,(viewport.clientHeight-52)/d.height));viewport.scrollTo(0,0);}
function select(i){selected=i;document.querySelectorAll('.panel').forEach((el,j)=>el.hidden=j!==i);document.querySelectorAll('nav button').forEach((el,j)=>el.setAttribute('aria-pressed',String(j===i)));const d=diagrams[i];document.getElementById('view-title').textContent=d.title;document.getElementById('description').textContent=d.description;document.getElementById('svg-link').href='rendered/'+d.slug+'.svg';document.getElementById('png-link').href='rendered/'+d.slug+'.png';document.getElementById('source-link').href='diagrams/'+d.file;fit();}
document.querySelectorAll('nav button').forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.tab))));document.getElementById('fit').onclick=fit;document.getElementById('plus').onclick=()=>zoom(scale*1.25);document.getElementById('minus').onclick=()=>zoom(scale/1.25);document.getElementById('actual').onclick=()=>zoom(1);window.addEventListener('resize',fit);select(0);
</script></body></html>`;
  fs.writeFileSync(path.join(__dirname,'architecture.html'),html);
  fs.writeFileSync(path.join(outDir,'manifest.json'),JSON.stringify(diagrams.map(({svg,...x})=>x),null,2)+'\n');
  await page.goto('file://'+path.join(__dirname,'architecture.html'));
  await page.setViewportSize({width:1600,height:1100});
  await page.screenshot({path:path.join(outDir,'viewer-preview.png'),fullPage:true});
  const result=await page.evaluate(()=>({tabs:document.querySelectorAll('nav button').length,svg:document.querySelectorAll('.panel svg').length,title:document.title}));
  assert.equal(result.tabs,7);assert.equal(result.svg,7);
  for(let i=0;i<7;i++){await page.locator('nav button').nth(i).click();assert.equal(await page.locator('.panel:not([hidden])').count(),1);}
  await page.locator('#plus').click();await page.locator('#minus').click();await page.locator('#actual').click();await page.locator('#fit').click();
  console.log(JSON.stringify({rendered:diagrams.length,validation:result,diagrams:diagrams.map(({slug,width,height})=>({slug,width,height}))},null,2));
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
