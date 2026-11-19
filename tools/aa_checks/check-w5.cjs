const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('aa/w5/examples/cards.js','utf8')+'\nthis.cards=cards;',ctx);
vm.runInContext(fs.readFileSync('aa/w5/examples/visuals.js','utf8').replace('return {has:id=>','this.api={scenarios,build,path,hashValue,probing}; return {has:id=>'),ctx);
const {cards,api}=ctx;let frames=0;const notes=fs.readFileSync('aa/w5/lecture-notes.html','utf8');
for(const c of cards){if(!c.visual)continue;assert.equal(c.walkthrough.length,3);assert(api.scenarios[c.visual]);for(const ref of c.refs)assert(notes.includes('id="topic-'+ref+'"'),ref);for(const f of api.scenarios[c.visual]()){assert(f.title&&f.caption&&f.html);assert(!/undefined|NaN/.test(f.html+f.caption));frames++;}}
assert.equal(cards.at(-1).end,180);assert.equal(cards.filter(c=>!c.visual).length,2);
const originals=[...notes.matchAll(/id="topic-([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(originals.filter(x=>!cards.some(c=>c.refs?.includes(x))),[]);
assert.equal(api.path([50,30,70,20,40,60,80],65).p.join(','),'50,70,60');assert.equal(api.path([50,30,70,20,40,60,80],65).found,false);
for(let k=0;k<=999;k++){for(const f of api.scenarios.hash(k))assert(!/NaN|undefined/.test(f.html+f.caption));const p=api.path([50,30,70,20,40,60,80],k);assert.equal(p.found,[50,30,70,20,40,60,80].includes(k));}
assert.equal(api.hashValue('ABRA'),22);const matches=api.scenarios.rabin().filter(f=>f.caption.includes('Report position')).map(f=>f.title);assert.equal(matches.length,2);assert(matches[0].endsWith('0'));assert(matches[1].endsWith('7'));
assert(api.scenarios.birthday(23).at(-1).html.includes('50.73%'));assert(api.scenarios.birthday(2).at(-1).html.includes('0.27%'));
assert(api.scenarios.probe().at(-1).html.includes('slot 2</small><b>20'));
assert(api.scenarios.chain().at(-1).html.includes('10 → 15 → 20'));
console.log(`${cards.length} screens, ${frames} visual frames; all original topic references covered; 1,000 search/hash inputs checked; counts and hash results verified.`);
