/*
TODO:

* Add issues for these todo items and remove this list

* Accomodate empty elements, for example:
```
Control, Type, Comment
Name, Textbox, 
Date Collected, Date Input, Optional if `Date Collected Unknown` selected
Date Collected Unknown, Checkbox,
```

Date Collecte has `Comment` column content but now other row does.

* Consider where to wrap long strings. For the moment, short content works fine. Very long strings will make all columns very wide.

* Set column widths independently rather than based on the broadest element in the entire table

* Add column widths or wraps to the column spec: needs some design.

* rename:
	BENDER: Bi-directional Editing of Neatly Delimited Enumerated Rows

* cleanup demo.html
	* put  #input, #output 50% width
	* but #input, #output side by side
	* reduce jank

* Change must function to accept style instead of bash color:
	* https://stackoverflow.com/a/54743816/832494
	* https://stackoverflow.com/a/34141979/832494

* Consider async:
	* https://gist.github.com/earonesty/2a8ac3a03e88ac90292cc28c823eb80b

* Cleanup tests

* Rename constants with leading prefix:
	* DD_ for delimited data
	* MD_ for markdown

* Scrutinize existing functions

* Add function documentation

* Plumb-through custom delimiter instead of expecting tab

* Discover the likely delimiter in delimited data

* When column spec is absent, infer based on type:
	* All same-length values: center
	* Booleans (Yes/No, Y/N, True/False, T/F, etc.)
	* Numeric: right
	* Date: center
	* Everything else: left

* Write an extension for VS Code to run these functions on highlighted text
	* Ctrl+Shift+/
	* Listening for context "editorHasSelection"
	* Automatically detects markdown by reading the initial rune.
*/

(function(){
    'use strict';
    
    function must(msg, fn) {
      try {
        fn();
        console.log('\x1b[32m%s\x1b[0m', '\u2714 ' + 'must ' + msg);
      } catch (error) {
        console.log('\n');
        console.log('\x1b[31m%s\x1b[0m', '\u2718 ' + 'must ' + msg);
        console.error(error);
      }
    }

    function assert(val) {
        if (!val) {
          throw new Error();
        }
    }

	function equalEnough(arr1, arr2) {
		return arr1.length === arr2.length && arr1.every((element, index) => element === arr2[index]);
	}

    const basic = 
`Column1	Column2	Column3
Value1	Value2	Value3`;

const advanced = 
`Column1	Column2	Column3	Column4	Column5
Value11	Value12	Value13	Value14	Value15
Value21	Value22	Value23	Value24	Value25
Value31	Value32	Value33	Value34	Value35`;

const aligned = 
`Column1	Column2	Column3	Column4	Column5
l	l	c	r	r
Value11	Value12	Value13	Value14	Value15
Value21	Value22	Value23	Value24	Value25
Value31	Value32	Value33	Value34	Value35`;

const real =
`Attribute	List	Set
Notation	[Square Brackets]	{Curly Brackets}
Order matters	Yes	No
Repetition allowed	Yes	No`;

    must('split input into lines', () => {
      let lines = tabler.getLines(basic);
      console.log(lines.length)
      assert(lines.length == 2);
    });

    must('have correct line input for basic line 0', () => {
      let lines = tabler.getLines(basic);
      assert(lines[0] == 'Column1	Column2	Column3');
    });

    must('have correct line input for basic line 1', () => {
      let lines = tabler.getLines(basic);
      assert(lines[1] == 'Value1	Value2	Value3');
    });

    must('expect an array and return an array of arrays', () => {
      let val = tabler.getRowInput(basic, '\t');

      // In this case, 2 rows with 3 values each
      assert(val.length == 2);
      assert(val[0].length == 3);
      assert(val[1].length == 3);
    });

    must('expect array of array values to be trimmed', () => {
      let val = tabler.getRowInput(basic, '\t');

      assert(val[0][2] == 'Column3');
    });

    must('discover maximum width by column', () => {
      let val = tabler.getRowInput(basic, '\t');
      let mw = tabler.findMaxWidths(val);

      assert(mw[0] == 7);
    });

    must('detect a spec in the second row', () => {
      let val = tabler.getRowInput(basic, '\t');
      assert(!tabler.isSpec(val[1]));
    }); 

    must('detect a synthetic spec', () => {
      let val = ['l','c','r'];
      assert(tabler.isSpec(val));
    }); 

    must('infer a spec row if spec is absent', () => {
      let val = tabler.getRowInput(basic, '\t');
      let spec = tabler.getSpec(val[1]);
      assert(tabler.isSpec(spec));
    });

    must('align text left', () => {
      let exp =  ' left       ';
      let act =  tabler.alignCell('left', 10, 'l')
      assert(exp == act);
    });

    must('align text right', () => {
      let exp = '      right '
      let act =  tabler.alignCell('right', 10, 'r');
      assert(exp == act);
    });

    must('align text center', () =>{
      let exp = '   center   ';
      let act =  tabler.alignCell('center', 10, 'c');
      assert(exp == act);
    });

    must('align text centerX', () =>{
      let exp = '   centerX   ';
      let act =  tabler.alignCell('centerX', 10, 'c');
      assert(exp == act);
    });

    must('align a row', () =>{
      let val = tabler.getRowInput(basic, '\t');
      let mw = tabler.findMaxWidths(val);
      let spec = tabler.getSpec(val[1]);
      let exp = [' Column1     ', ' Column2     ', ' Column3     '];
      let act = tabler.alignRow(val[0], mw,spec)
      assert(exp[0] == act[0]);
      assert(exp[1] == act[1]);
      assert(exp[2] == act[2]);
    });

    must('markdown join a row', () =>{
      let val = tabler.getRowInput(basic, '\t');
      let mw = tabler.findMaxWidths(val);
      let spec = tabler.getSpec(val[1]);
      let exp = '| Column1     | Column2     | Column3     |';
      let act = tabler.markdownRow(tabler.alignRow(val[0], mw,spec));
      assert(exp == act);
    });

    must('markdown join spec row', () => {
      let gri = tabler.getRowInput(basic, '\t');
      let fmw = tabler.findMaxWidths(gri);
      let spc = tabler.getSpec(gri[1]);
      let exp = '|:------------|:------------|:------------|';     
      let act = tabler.markdownSpecRow(fmw, spc);
      assert(exp == act);
    });

    must('markdown join aligned spec row', () => {
      let gri = tabler.getRowInput(aligned, '\t');
      let fmw = tabler.findMaxWidths(gri);
      let spc = tabler.getSpec(gri[1]);
      let exp = '|:------------|:------------|:-----------:|------------:|------------:|';     
      let act = tabler.markdownSpecRow(fmw, spc);
      assert(exp == act);
    });

    must('compose a basic table', () => {
      let exp =
`| Column1     | Column2     | Column3     |
|:------------|:------------|:------------|
| Value1      | Value2      | Value3      |`;

      let act = tabler.markdownTable(basic);
      assert(exp == act)
    });

    must('compose an advanced table', () => {
      let exp =
`| Column1     | Column2     | Column3     | Column4     | Column5     |
|:------------|:------------|:------------|:------------|:------------|
| Value11     | Value12     | Value13     | Value14     | Value15     |
| Value21     | Value22     | Value23     | Value24     | Value25     |
| Value31     | Value32     | Value33     | Value34     | Value35     |`;

      let act = tabler.markdownTable(advanced);
      assert(exp == act)
    });

    must('compose an aligned table', () => {
      let exp =
`| Column1     | Column2     |   Column3   |     Column4 |     Column5 |
|:------------|:------------|:-----------:|------------:|------------:|
| Value11     | Value12     |   Value13   |     Value14 |     Value15 |
| Value21     | Value22     |   Value23   |     Value24 |     Value25 |
| Value31     | Value32     |   Value33   |     Value34 |     Value35 |`;

      let act = tabler.markdownTable(aligned);
      assert(exp == act)
    });

	must('compose from real(ish) values', () => {
		let exp =
`| Attribute              | List                  | Set                  |
|:-----------------------|:----------------------|:---------------------|
| Notation               | [Square Brackets]     | {Curly Brackets}     |
| Order matters          | Yes                   | No                   |
| Repetition allowed     | Yes                   | No                   |`;
  
		let act = tabler.markdownTable(real);
		assert(exp == act)
	  });

	must('decompose a row spec from a md row spec',() => {
		let exp = ['l','l','c','r','r'];
		let spec = [
			"",
			":------------",
			":------------",
			":-----------:",
			"------------:",
			"------------:",
			""
		]
		let act = tabler.getSpecFromSpec(spec);
		assert(equalEnough(exp, act));
	});

	must('decompose a row spec from generated md',() => {
		let md = tabler.markdownTable(real);
		let gri = tabler.getRowInput(md, '|');
		let exp = ['l','l','l'];
		let act = tabler.getSpecFromSpec(gri[1]);
		assert(equalEnough(exp, act));
	});

	must('decompose to values', () => {
		let exp = real;
		let md = tabler.markdownTable(real);
		let act = tabler.getDelimitedFromMarkdown(md);
		assert(exp == act)
	  });

})();

// console.log(exp, exp.length)
// console.log(act, act.length);