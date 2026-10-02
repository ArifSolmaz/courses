const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const scope={};vm.createContext(scope);vm.runInContext(fs.readFileSync(__dirname+'/errors.js','utf8')+';this.describe=describePythonError',scope);
const sources=new Map([[9,'# review\nname = "Elif"\nage = 19\ngpa ='],[13,'def divide():\n    return 1 / 0']]);
let e=scope.describe('PythonError: Traceback (most recent call last):\n  File "/lib/python313.zip/_pyodide/_base.py", line 597\n  File "Cell 10", line 4\n    gpa =\nSyntaxError: invalid syntax',9,sources);
assert.equal(e.type,'SyntaxError');assert.equal(e.line,4);assert.equal(e.cell,9);assert.match(e.hint,/assignment is incomplete/);
e=scope.describe('Traceback (most recent call last):\n  File "Cell 10", line 1\n  File "Cell 14", line 2\nZeroDivisionError: division by zero',9,sources);
assert.equal(e.cell,13);assert.equal(e.line,2);assert.match(e.hint,/divisor is zero/);
for(const kind of ['NameError','TypeError','ValueError','IndentationError','TabError','IndexError','KeyError','EOFError','AssertionError']){
 const e=scope.describe(`Traceback:\n  File "Cell 10", line 2\n${kind}: test`,9,sources);assert.equal(e.type,kind);assert.equal(e.line,2);assert.ok(e.hint.length>30);
}
e=scope.describe('Unrecognised engine failure',9,sources);assert.equal(e.line,null);assert.equal(e.type,'Python error');
console.log('PASS: syntax location, cross-cell function traceback, nine common error types and unknown fallback');
