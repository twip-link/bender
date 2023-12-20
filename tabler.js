(function(){
    'use strict';

    var tabler = {};
    self.tabler = tabler;
    
    tabler.GUTTER = 4;

    tabler.getLines = (str) => {
        return str.split('\n')
    }

    tabler.getRowInput = (str, sep) => {
        let lines = tabler.getLines(str);
        let rows = [];

        for (let line of lines){
            rows.push(line.split(sep).map(val => val.trim()))
        }

        return rows;
    }

    // todo: while finding max widths, 
    // also check min len and max len across all rows. 
    // If ever they differ, say so.
    tabler.findMaxWidths = (tbl) => {
        let res = tbl[0].map(() => 0);
        tbl.forEach(row => {
            row.forEach((val, index) => {
                res[index] = Math.max(res[index], val.length);
            });
        });
        return res;
    }

    // ensure a row is a spec
    tabler.isSpec = (row) => {
        return row.every(val => val === 'l' || val === 'c' || val === 'r');
    }

    // return a spec if the row doesn't have one
    tabler.getSpec = (row) => {
        if (tabler.isSpec(row)) {
            return row
        }
        return Array(row.length).fill('l');
    }
        
    // return a column value, aligned over a specific width
    // these values with be joined with a pipe when rendering markdown
    tabler.alignCell = (text, width, align) => {
        if (text.length >= width) throw new Error('alignText: insufficient width');
    
        const pad = width - text.length;
        let lpad, rpad = 0;

        if (align == 'l') {
            rpad = pad;
        }
        if (align == 'r') {
            lpad = pad;
        }
        if (align == 'c'){
            lpad = Math.floor(pad / 2);
            rpad = pad - lpad;
        }

        if (lpad < rpad) lpad ++;

        return ' ' + ' '.repeat(lpad) + text + ' '.repeat(rpad) + ' ';
    }

    tabler.alignRow = (row, width, spc) => {
        let res = [];
        for (let i=0; i < row.length; i++){
            res.push(tabler.alignCell(row[i], width[i] + tabler.GUTTER, spc[i]));
        }

        return res;
    }

    tabler.markdownRow = (row) => {
        return '|' + row.join("|") + '|';
    }
    
    tabler.markdownSpecRow = (width, spc) => {
        let res = [];
        for (let i=0; i < spc.length; i++){
            res.push(tabler.markdownSpec(width[i] + tabler.GUTTER, spc[i]));
        }       

        return tabler.markdownRow(res);
    }

    tabler.markdownSpec = (width, align) => {
        let lcolon = align == 'l' || align == 'c' ? ':' : ''; 
        let rcolon = align == 'r' || align == 'c' ? ':' : '';

        let offset = align == 'c' ? 1 : 0;

        return lcolon + '-'.repeat(width + 1 - offset) + rcolon
    }

    tabler.markdownTable = (tsv) => {
        let gri = tabler.getRowInput(tsv,'\t');
        let fmw = tabler.findMaxWidths(gri);
        let spc = tabler.getSpec(gri[1]);
        let md1 = tabler.markdownRow(tabler.alignRow(gri[0], fmw, spc));
        let md2 = tabler.markdownSpecRow(fmw, spc);
        
        let tbl = [];
        tbl.push(md1);
        tbl.push(md2);
  
        gri.shift();
        if (tabler.isSpec(gri[0])) gri.shift();
  
        for (let i=0; i < gri.length; i++){
          tbl.push(tabler.markdownRow(tabler.alignRow(gri[i], fmw, spc)));
        }  
  
        let md = tbl.join('\n');
        return md;
    }

	tabler.getSpecFromSpec = (spc) => {
		let res = [];

		// eject the first and last elements, since they're empty:
		spc.shift();
		spc.pop();

		// then examine the next first and last elements of each value
		// assign l, c, and r based on colons present
		for (let i=0; i < spc.length; i++){
			let first = spc[i][0];
			let last = spc[i][spc[i].length-1];

			if (first == ':' && last == ':') {
				res.push('c');
				continue;
			}
			if (first == ':') {
				res.push('l');
				continue;
			}
			if (last == ':') {
				res.push('r');
				continue;
			}
		  }  
		
		return res;
	}

	tabler.getDelimitedFromMarkdown = (md) => {
		let res = [];
		let delim = '\t';

		// get the row input and dump the empty values
		let gri = tabler.getRowInput(md, '|');

		// push the header row
		let head = tabler.nonEmptyJoin(gri.shift(), delim);
		res.push(head);

		// push the column spec
		let spc = tabler.getSpecFromSpec(gri.shift());
		if (!spc.every(val => val === 'l')){
			tabler.nonEmptyJoin(spc, delim);
		}

		// push the remaining rows
		for (let row of gri){
            res.push(tabler.nonEmptyJoin(row, delim));
        }

		return res.join('\n');
	}

	tabler.nonEmptyJoin = (arr, delim) => {
		return arr.filter(val => val).join(delim);
	}

})();