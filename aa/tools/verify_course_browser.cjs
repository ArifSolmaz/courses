/* Full rendered course sweep. Usage: node verify_course_browser.cjs AA_URL REPORT.json [SCREENSHOT_DIR]
 * Requires Playwright and a running static server. Intentional scroll containers are allowed. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path');
const base=(process.argv[2]||'http://127.0.0.1:8873/courses/aa').replace(/\/$/,'');
const report=process.argv[3]||path.join(require('node:os').tmpdir(),'aa-browser.json');
const shots=process.argv[4];
const root=path.resolve(__dirname,'..');
const routes=[];for(let n=1;n<=14;n++){routes.push(`w${n}/`);for(const s of ['ek-notlar','tekrar'])if(fs.existsSync(path.join(root,`w${n}`,s,'index.html')))routes.push(`w${n}/${s}/`);}
if(process.env.AA_INCLUDE_AUX)routes.push('','scope/','review/','textbook-problems/');
(async()=>{const browser=await chromium.launch();const results=[];if(shots)fs.mkdirSync(shots,{recursive:true});
for(const route of routes.filter(r=>!process.env.AA_ROUTE_FILTER||new RegExp(process.env.AA_ROUTE_FILTER).test(r))){const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
await page.goto(`${base}/${route}`);await page.waitForTimeout(150);
const themeResult=await page.evaluate(()=>{const b=document.querySelector('#tg,[data-theme-toggle]');if(!b)return false;const h=document.documentElement,before=h.dataset.theme;b.click();const after=h.dataset.theme;b.click();return before!==after&&before===h.dataset.theme});
await page.evaluate(()=>{document.querySelectorAll('details').forEach(e=>e.open=!e.classList.contains('week-switch'));document.querySelectorAll('.week-panel,.source-exercise,.question-answer').forEach(e=>e.hidden=false)});
for(const width of [320,375,430,768,1366])for(const theme of ['light','dark']){await page.setViewportSize({width,height:900});await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);await page.waitForTimeout(200);
let navigation=await page.evaluate(()=>{
 const inside=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.left>=-1&&r.right<=innerWidth+1};
 const menu=document.querySelector('.week-switch');let ok=true;
 if(menu){const summary=menu.querySelector('summary');summary.click();ok=menu.open&&inside(menu.querySelector('div'));summary.click();}
 return ok;
});
const fab=page.locator('#aa-fab');
if(await fab.count()&&await fab.isVisible()){
 await fab.click();
 // Wait for the sidebar's slide-in transition before measuring the open state.
 try{await page.waitForFunction(()=>{const r=document.getElementById('aa-sb').getBoundingClientRect();return r.width>0&&r.left>=-1&&r.right<=innerWidth+1&&document.getElementById('aa-fab').getAttribute('aria-expanded')==='true'},{},{timeout:1500});}catch{navigation=false;}
 await fab.click();await page.waitForFunction(()=>!document.body.classList.contains('aa-open'));
}
const data=await page.evaluate(()=>{
 const visible=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};const all=s=>[...document.querySelectorAll(s)].filter(visible);
 const describe=e=>({tag:e.tagName,id:e.id,cls:typeof e.className==='string'?e.className:e.className.baseVal,text:e.textContent.trim().slice(0,100),width:Math.round(e.getBoundingClientRect().width)});
 const escapes=e=>{let p=e;while(p){const s=getComputedStyle(p);if(['auto','scroll','hidden','clip'].includes(s.overflowX))return false;p=p.parentElement}const r=e.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1};
 const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
 const unlabelled=all('input:not([type=hidden]),select,textarea').filter(e=>!e.labels?.length&&!e.hasAttribute('aria-label')&&!e.hasAttribute('aria-labelledby')).map(describe);
 const tokens=all('.aa-token').filter(e=>e.children.length===0).filter(e=>{const range=document.createRange();range.selectNodeContents(e);return range.getClientRects().length>1}).map(describe);
 const tables=all('table');const nakedTables=tables.filter(t=>t.scrollWidth>t.clientWidth+1&&!t.closest('.scroll,.table-wrap,.anim-table-wrap')).map(describe);
 const badLinks=all('a[href]').filter(a=>{const u=new URL(a.href);return u.pathname===location.pathname&&u.hash&&!document.getElementById(decodeURIComponent(u.hash.slice(1)))}).map(a=>a.getAttribute('href'));
 return {pageWidth:document.documentElement.scrollWidth,viewport:innerWidth,escaped:all('table,pre,input,select,textarea,button,svg,canvas,.formula,.m,h1,h2,h3').filter(escapes).map(describe),unlabelled,splitTokens:tokens,nakedTables,badLinks,duplicateIds:ids.filter((x,i)=>ids.indexOf(x)!==i),counts:{tables:tables.length,code:all('pre').length,controls:all('input,select,textarea,button').length,visuals:all('svg,canvas').length}};
});results.push({route,width,theme,themeToggle:themeResult,navigation,errors:[...new Set(errors)],...data});
if(shots&&[320,768,1366].includes(width)){await page.screenshot({path:path.join(shots,`${route.replaceAll('/','-')}${width}-${theme}.png`)});}
}
console.log(route,results.filter(r=>r.route===route).map(r=>`${r.width}/${r.theme}: width${r.pageWidth} escaped${r.escaped.length} errors${r.errors.length} labels${r.unlabelled.length} split${r.splitTokens.length} nav${r.navigation?'OK':'FAIL'}`).join(' '));await page.close();fs.writeFileSync(report,JSON.stringify(results,null,2));}
await browser.close();const failures=results.filter(r=>r.pageWidth>r.viewport+1||r.escaped.length||r.unlabelled.length||r.splitTokens.length||r.nakedTables.length||r.badLinks.length||r.duplicateIds.length||r.errors.length||!r.themeToggle||!r.navigation);console.log(`${results.length} viewport/theme cases; ${failures.length} failures`);if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
