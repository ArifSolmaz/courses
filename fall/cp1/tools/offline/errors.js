// Parse only student-cell locations; keep the original traceback for inspection.
function describePythonError(text, activeId, sources) {
  const frames=[...text.matchAll(/File "(?:Cell (\d+)|(<exec>))", line (\d+)/g)];
  const frame=frames.at(-1), cell=frame?.[1]?Number(frame[1])-1:activeId;
  const line=frame?Number(frame[3]):null;
  const tail=text.trim().split('\n').at(-1)||'Python could not finish this cell.';
  const match=tail.match(/^([A-Za-z_]\w*(?:Error|Exception)|KeyboardInterrupt|SystemExit)(?::\s*(.*))?$/);
  const type=match?.[1]||'Python error', message=match?.[2]||tail;
  const source=sources.get(cell)||'', code=line?source.split('\n')[line-1]||'':'';
  let hint={
    NameError:'This name has no value yet. Check its spelling and run the earlier cell that defines it. Lesson and solution variables are separate.',
    TypeError:'Check the types of the values in this operation. For example, input() returns text; convert it when a number is needed.',
    ZeroDivisionError:'The divisor is zero. Check it before dividing, and decide what your program should do for zero.',
    IndentationError:'Indentation defines a Python block. Use four spaces inside if, elif, else, or a loop, and align matching branches.',
    TabError:'Tabs and spaces are mixed. Use spaces consistently for indentation.',
    ValueError:'The value has the right general type but is not accepted here. Check the input before converting or using it.',
    IndexError:'The position is outside the sequence. The first position is 0; the last is length minus 1.',
    KeyError:'That key is missing from the dictionary. Check its spelling or test whether the key exists.',
    EOFError:'This code asked for more input. Open Input values below the cell and enter one response per input() call.',
    AssertionError:'A check did not match its expected result. Run the related answer cell first, then compare the input, actual result and expectation.',
    SyntaxError:'Python could not read this statement. Check this line and the line before it for missing values, quotes, brackets or a colon.'
  }[type]||'Read the Python message, check the indicated code, then edit and run again.';
  if(type==='SyntaxError' && /^\s*[A-Za-z_]\w*\s*=\s*(?:#.*)?$/.test(code)){
    const name=code.trim().split(/\s*=/)[0];
    hint='The assignment is incomplete. Put a value or expression after =. For example: '+name+' = '+(name==='gpa'?'3.45':'10')+'. Choose the value your program needs.';
  }
  return {type,message,hint,cell,line,source,text,syntax:['SyntaxError','IndentationError','TabError'].includes(type)};
}
