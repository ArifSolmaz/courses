// Test the student's guided edit path with real history and lightweight DOM controls.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
class Element{
  constructor(){this.children=[];this.handlers={};this.value='';this.hidden=false;}
  setAttribute(){} append(...items){this.children.push(...items);} after(item){this.note=item;}
  addEventListener(type,fn){(this.handlers[type]??=[]).push(fn);}
  dispatchEvent(e){this.oninput?.(e);for(const fn of this.handlers[e.type]||[])fn(e);}
  querySelector(){return this.run;}
  getClientRects(){return [];}
}
const original='values = [1, 2]\nprint(values)\n',changed='values = [1, 2, 3]\nprint(values)\n';
const context=vm.createContext({document:{createElement:()=>new Element()},Event:class {constructor(type){this.type=type;}},ORIGINAL:{cells:[{source:[original],metadata:{cp1_guided_change:{old:'[1, 2]',new:'[1, 2, 3]',source:changed}}}]}});
vm.runInContext(fs.readFileSync(__dirname+'/code_history.js','utf8'),context);
const app=fs.readFileSync(__dirname+'/app.js','utf8');
vm.runInContext(app.slice(app.indexOf('function addGuidedChange('),app.indexOf('function render(){')),context);
const editor=new Element(),bar=new Element(),pane=new Element();bar.run=new Element();editor.value=original;
let saved,reads=0;editor.oninput=()=>{saved=editor.value;};editor.showForReading=()=>reads++;
context.editor=editor;context.bar=bar;context.pane=pane;
vm.runInContext('addCodeHistory(bar,editor,0);addGuidedChange(pane,editor,0);',context);
const [undo,restore]=bar.children[0].children,apply=pane.children[0].children[2];
assert.equal(apply.disabled,false);apply.onclick();assert.equal(editor.value,changed);assert.equal(saved,changed);assert.equal(reads,1);assert.equal(apply.disabled,true);
undo.onclick();assert.equal(editor.value,original);assert.equal(apply.disabled,false);
editor.value='my custom program';editor.dispatchEvent({type:'input'});
assert.equal(apply.disabled,true);apply.onclick();assert.equal(editor.value,'my custom program');
restore.onclick();assert.equal(editor.value,original);assert.equal(apply.disabled,false);
undo.onclick();assert.equal(editor.value,'my custom program');
restore.onclick();apply.onclick();assert.equal(editor.value,changed);
console.log('Suggested edit, saved code, undo, reversible restore and custom-edit protection pass.');
