/**
 * Title: addHidden
 * Description: Add to hidden array of BioJsObject
 * @param {hidden(Object)}
 * @returns {id (int)} returns -1 on failure
 */
function addHidden ( h ) {
		var id = '-1';
		var hidden = {};
		
		if ( h instanceof Object && h.start <= h.end ) {
			id = h.id;
			
			hidden = { "start": h.start, "end": h.end, "id": h.id };
			
			this._hidden.push(hidden);
			//this._applyHighlight(highlight);
			//this._restoreSelection(h.start,h.end);
		} 
		
		return id;
}
	/* 
     * Function: Biojs.Sequence._applyHighlight
     * Purpose:  Apply the specified color and background to a region between 'start' and 'end'.
     * Returns:  -
     * Inputs: highlight -> {Object} An object containing the fields start (int), end (int), 
     * 						color (HTML color string) and background (HTML color string).
     *
	_applyHighlight: function ( highlight ) {		
		var seq = this._contentDiv.find('.sequence');
		for ( var i = highlight.start - 1; i < highlight.end; i++ ){
			zindex = jQuery(seq[i]).css("z-index");
			if (zindex=="auto"){
				 z = 1;
				 o = 1;
			 }
			 else{
				 z = 0;
				 o = 0.5;
			 }
			jQuery(seq[i])
				.css({ 
					"color": highlight.color,
					"background-color": highlight.background,
					"z-index": z,
					"opacity": 1
					})
				.addClass("highlighted");
		}

	    if(this.opt.format == 'SVG'){
		var svgNS2 = this.opt.svg.namespaceURI;
		var svgElement;
		var x_coord;
		var y_coord;
		var rect;
		var id;

		for(var n = highlight.start; n <=highlight.end; n++) {
		    id = '0_'+n;
		    svgElement = document.getElementById(id);
		    console.log(svgElement);
		    x_coord = svgElement.getAttribute('x');
		    y_coord = svgElement.getAttribute('y') - 13;
		    rect = document.createElementNS(svgNS2,'rect');
		    rect.setAttribute('x',x_coord);
		    rect.setAttribute('y',y_coord);
		    rect.setAttribute('width',17);
		    rect.setAttribute('height',17);
		    rect.setAttribute('fill',highlight.background);
		    this.opt.svg.appendChild(rect);
		}
		this.opt.svg.appendChild(this.opt.text);
		document.getElementById("test_mk1").appendChild(this.opt.svg);
	    }
	},

*/
