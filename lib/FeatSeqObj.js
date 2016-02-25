/**
 * Short module introducing the FeatSeq object
 * A beautiful object which joins feature and sequence 
 **/

var FeatSeq = function(feat, seq, target) {
	this._feature = feature;
	this._sequence = seq;
	this._container = jQuery( "#" + target);
	this._dispOpt = {
		hidden : [],
		Highlighted: [],
		lowercase: []
	};
}

FeatSeq.prototype = {

	_addHidden: function(hidden) {
		this._dispOpt.hidden.push(hidden);
		this._applyHidden(hidden);
	},

	_applyHidden: function(h) {		
		var seq = this._container.find('.sequence');
		for ( var i = h.start - 1; i < h.end; i++ ){
			jQuery(seq[i])
				.css({ 
					"display" : "none"
					})
				.addClass("hidden");
		}
	},

	_removeHidden: function(h) { //TWS FIXME needs to change hidden array
		var seq = this._container.find('.sequence');
		for ( var i = h.start - 1; i < h.end; i++ ){
			jQuery(seq[i])
				.css({ 
					"display" : "inline"
					})
				.removeClass("hidden");
		}
	},
/*
	_addHighlight: function(highlight) {
		this.dispOpt.highlighted.push(highlight);
		this._applyHighlight(highlight);
	},

	_applyHighlight: function ( highlight ) {		
		var seq = this._target.find('.sequence');
		for ( var i = highlight.start - 1; i < highlight.end; i++ ){
			jQuery(seq[i])
				.css({ 
					"color": highlight.color,
					"background-color": highlight.background,
					"opacity": 1
					})
				.addClass("highlighted");
		}
	},

	_removeHighlight: function(highlight) {
		
		
*/
	_addLowercase: function(lower) {
		this._dispOpt.lowercase.push(lower);
		this._applyLowercase(lower);
	},

	_applyLowercase: = function(l) {		
		var seq = this._target.find('.sequence');
		for ( var i = l.start - 1; i < l.end; i++ ){
			var base = jQuery(seq[i]).text().toLowerCase();
			jQuery(seq[i]).text(base);
		}
	},

	_removeLowercase: function(l) {	//TWS FIXME needs to change lowercase array
		var seq = this._target.find('.sequence');
		for ( var i = l.start - 1; i < l.end; i++ ){
			var base = jQuery(seq[i]).text().toUpperCase();
			jQuery(seq[i]).text(base);
		}
	}
}
