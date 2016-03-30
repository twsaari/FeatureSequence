define([
           'dojo/_base/declare',
           'dojo/_base/array',
           'dojo/_base/lang',
           'dojo/Deferred',
		   'dojo/dom-construct',
		   'dojo/dom-class',
           'dojo/dom-style',
		   'dojo/query',
           'dijit/registry',
           'dijit/form/ToggleButton',
           'dijit/Dialog'
       ],
       function(
           declare,
           array,
           lang,
           Deferred,
		   domConstruct,
		   domClass,
           domStyle,
		   query,
           registry,
           ToggleButton,
           Dialog
       ) {
return declare( null,
{
    feature: -1,
    seq: -1,

    constructor: function(feat, seq, opt){
        var self = this;
        //console.log("Calling FeatureSequence"); //TWS DEBUG
        this.feat = feat;
        this.seq = seq;
        this.opt = opt;
        this._hidden = [];
        this._highlighted = [];
        this._lowercase = [];

        this._initialize(self);

    },

    _initialize: function(self) {
        //console.log("Calling initialize"); //TWS DEBUG
        var container = dojo.create('div', {
    		//id: "FeatureSeq_container", 
	    	className: 'FeatureSequenceContainer', 
	    	innerHTML: '' 
	    });

	    var button_container = dojo.create('div', {
	    	//id: 'button_container',
	    	className: 'button_container' 
	    }, container );
	    var metaTable = dojo.create('table', { 
            //id: "button_meta_table",
            className: 'button_meta_table'
        }, button_container );
        dojo.create( 'div', {
            //id: "seq_display",
            className: "seq_display",
            innerHTML: ''
        },container);

        self.feat._types.forEach(function(type){

            var row = dojo.create('tr', {
                //id: type+'_buttonRow',
                className:'buttonRow',
                innerHTML: '<td class="col1_td"><b class="rowName">'+type+'s'+'</b></td>'
            }, metaTable );

            var highlight_td = dojo.create('td', {
                className: 'button_td'
            }, row );

            var highlightButton = new ToggleButton({
		        //id: type+"_highlightButton",
                style: "width: 85px;",
		        checked: false,
    		    //iconClass: "dijitCheckBoxIcon",
	    	    label: 'Highlight',
		        onChange: function(){
			        if (this.checked) {
                        var colorstr = pastelColors();
				        this.set('label', 'Unhighlight');
                        self._addHighlight(type, colorstr);
			        }
			        else {
				        this.set('label', 'Highlight');
                        self._removeHighlight(type);
			        }
		        }
    	    });

            var textCase_td = dojo.create('td', {
                className: 'button_td'
            }, row );

	        var textCaseButton = new ToggleButton({
		        //id: type+"Lowercase",
                style: "width: 78px;",
		        checked: false,
		        //iconClass: "dijitCheckBoxIcon",
		        label: 'Lowercase',
		        onChange: function(){
			        if (this.checked) {
                        self._addLowercase(type);
				        this.set('label', 'Uppercase');
			        }
			        else {
                        self._removeLowercase(type);
				        this.set('label', 'Lowercase');
			        }
		        }
	        });

            var hideShow_td = dojo.create('td', {
                className: 'button_td'
            }, row );

	        var hideShowButton = new ToggleButton({
		        //id: type+"hide",
                style: "width: 48px;",
		        checked: false,
		        //iconClass: "dijitCheckBoxIcon",
		        label: 'Hide',
                onChange: function(){
			        if (this.checked) {
                        self._addHidden(type);
				        this.set('label', 'Show');
			        }
			        else {
                        self._removeHidden(type);
				        this.set('label', 'Hide');
			        }
		        }
	        });

            highlightButton.placeAt(highlight_td);
	        textCaseButton.placeAt(textCase_td);
	        hideShowButton.placeAt(hideShow_td);

        });

        //TWS Left Off Here 3-23-2016. Next step: Possibly simplify code for Highlight
        // and Lowercase buttons

        ['upstream','downstream'].forEach(function(type) {

            var row = dojo.create('tr', {
                //id: type+'_buttonRow',
                className:'buttonRow',
                innerHTML: '<td class="col1_td"><b class="rowName">'+type+'</b></td>'
            }, metaTable );

            var highlight_td = dojo.create('td', {
                className: 'button_td'
            }, row );

            var highlightButton = new ToggleButton({
		        //id: type+"_highlightButton",
                style: "width: 85px;",
		        checked: false,
    		    //iconClass: "dijitCheckBoxIcon",
	    	    label: 'Highlight',
		        onChange: function(){
			        if (this.checked) {
                        var colorstr = pastelColors();
				        this.set('label', 'Unhighlight');
                        self._addHighlight(type, colorstr);
			        }
			        else {
				        this.set('label', 'Highlight');
                        self._removeHighlight(type);
			        }
		        }
    	    });

            var textCase_td = dojo.create('td', {
                className: 'button_td'
            }, row );

	        var textCaseButton = new ToggleButton({
		        //id: type+"Lowercase",
                style: "width: 78px;",
		        checked: false,
		        //iconClass: "dijitCheckBoxIcon",
		        label: 'Lowercase',
		        onChange: function(){
			        if (this.checked) {
                        self._addLowercase(type);
				        this.set('label', 'Uppercase');
			        }
			        else {
                        self._removeLowercase(type);
				        this.set('label', 'Lowercase');
			        }
		        }
	        });

            var viewLen_td = dojo.create('td', {
                className: 'button_td'
            }, row );

            var SeqMenu = new dijit.form.Select({
                style: "width: 92px",
                className: type+'SeqMenu',
            	id: type+'SeqMenu',
                options: [
	                { label: "Select View", value: "-1" , selected:true},
                    { label: "500 bp", value: "0" },
                    { label: "1000 bp", value: "1"},
                    { label: "1500 bp", value: "2"},
                    { label: "2000 bp", value: "3"},
                    { label: "2500 bp", value: "4"},
                    { label: "3000 bp", value: "5"}, 
                    { label: "3500 bp", value: "6"},
                    { label: "4000 bp", value: "7"}
                ]
            });

            highlightButton.placeAt(highlight_td);
	        textCaseButton.placeAt(textCase_td);
	        SeqMenu.placeAt(viewLen_td);
        });

        registry.byId('upstreamSeqMenu').on("change", function() {
            var selected = this.get("value");
            dojo.query('.upstreamSequence').reverse().forEach(function(node,index) {
	            if (index <= selected) {
                    node.style.display = "inline";
                } else {
                    node.style.display = "none";
                }
            });
        });
        
        registry.byId('downstreamSeqMenu').on("change", function() {
            var selected = this.get("value");
            dojo.query('.downstreamSequence').forEach(function(node,index) {
	            if (index <= selected) {
                    node.style.display = "inline";
                } else {
                    node.style.display = "none";
                }
            });
        });

        var seqBox = this._DrawFasta();

        domConstruct.place(seqBox,container);

        var myDialog = new Dialog({
            title: "FeatureSequence Viewer",
            content: container,
            onHide: function() {
                registry.byId('downstreamSeqMenu').destroy();
                registry.byId('upstreamSeqMenu').destroy();
                myDialog.destroy();
            }
        });

        //console.log("Calling myDialog.show()");
        myDialog.show();

    },

	_addHidden: function(type) {
        //console.log("Calling _addHidden"); //TWS DEBUG
        query('span[subfType=\"'+type+'\"]').forEach(function(span) {
            domStyle.set(span, "display", "none");
        });
    },

	_removeHidden: function(type) {
        //console.log("Calling _removeHidden"); //TWS DEBUG
        query('span[subfType=\"'+type+'\"]').forEach(function(span) {
            domStyle.set(span, "display", "inline");
        });
	},

    _addHighlight: function(type, color) {
        //console.log("Calling _addHighlight"); //TWS DEBUG
        query('span[subfType=\"'+type+'\"]').forEach(function(span) {
            domStyle.set(span, "background-color", color);
        });
	},

	_removeHighlight: function(type) {
        //console.log("Calling _removeHighlight"); //TWS DEBUG
        query('span[subfType=\"'+type+'\"]').forEach(function(span) {
            domStyle.set(span, "background-color", "#FFF");
        });
	},

	_addLowercase: function(type) {
        //console.log("Calling _addLowercase"); //TWS DEBUG
        query('span[subfType=\"'+type+'\"]').forEach(function(span) {
            var string = span.innerHTML.toLowerCase();
            span.innerHTML = string;
        });
	},

	_removeLowercase: function(type) {
        //console.log("Calling _removeLowercase"); //TWS DEBUG
        query('span[subfType=\"'+type+'\"]').forEach(function(span) {
            var string = span.innerHTML.toUpperCase();
            span.innerHTML = string;
        });
	},

    _DrawFasta: function() {
		//console.log("Calling DrawFasta"); //TWS debug

        //Split upstream/downstream sequence into 500bp chunks
        var upstream_arr = this.seq.upstream.toUpperCase().match(/.{1,500}/g);
        var downstream_arr = this.seq.downstream.toUpperCase().match(/.{1,500}/g);

        var targetSeq = this.seq.target.toUpperCase();
        var subfeatures = this.feat._subfeatures;
/*
        //Fill in gaps in subfeatures - add in results from fillTheGaps() and re-sort
        subfeatures = subfeatures.concat(fillTheGaps(this.feat._relCoords, subfeatures)).sort(function(a,b){return a.start - b.start});
*/
        //Split target sequence based on subfeatures
        var target_arr = array.map(subfeatures, function(obj) {

            return {type: obj.type, seq: targetSeq.substring(obj.start, obj.end)};
            //TWS Possible improvement: include id: obj.id here, and use this to identify divs rather than querying by subfType attribute
        });

        //Create sequence box
		var seqBox = dojo.create('div', { 
			className: 'sequence_box',
			innerHTML: '<span class="sequence_title">'+'&gt' + this.feat._id + '</span><br>'
		});

        //Create spans and place them within sequence box
        upstream_arr.forEach(function(string,index,arr) {
            //indexed in reverse order for upstream. Zero index closest to target sequence
            var complementary_index = arr.length - 1 - index;
            var spn = dojo.create('span', {
                id: 'upstream_'+complementary_index,
                subfType: 'upstream',
                className: 'upstreamSequence',
                innerHTML: string
            });
            domConstruct.place(spn, seqBox);
        });

		target_arr.forEach(function(chunk,index) {
            var spn = dojo.create('span', {
                //id: 'targetseq_'+index,
                subfType: chunk.type,
                className: 'sequence',
                innerHTML: chunk.seq});
            domConstruct.place(spn, seqBox);
        });

        downstream_arr.forEach(function(string,index) {
            var spn = dojo.create('span', {
                id: 'downstream_'+index,
                subfType: 'downstream',
                className: 'downstreamSequence',
                innerHTML: string
            });
            domConstruct.place(spn, seqBox);
        });



    return seqBox;

	}
            
});
});

/*
function fillTheGaps (coords, subfeatures) {

	var gaps = [];
	if (subfeatures[0].start != coords.start) {
  	    //console.log("Filling in the start");
        var feat = {start: coords.start, end: subfeatures[0].start, type: null}
        gaps.push(feat);
    }
  
    //console.log("Filling in the middle bits");
    for (i = 0; i < subfeatures.length - 1; i++) {
  	    if ( subfeatures[i].end != subfeatures[i+1].start) {
        	var feat = {start: subfeatures[i].end, end: subfeatures[i+1].start, type: null};
            gaps.push(feat);
        }
    }

    if (subfeatures[subfeatures.length - 1].end != coords.end) {
  	    //console.log("Filling in the end");
        var feat = {start: subfeatures[subfeatures.length - 1].end, end: coords.end, type: null};
        gaps.push(feat);
    }
        
  return gaps;  
}
*/

/**
 * Title: pastelColors
 * Description: Creates a randomized pastel color.
 * @param {}
 * @returns { color (string) }
 */
function pastelColors(){
    var r = (Math.round(Math.random()* 127) + 127).toString(16);
    var g = (Math.round(Math.random()* 127) + 127).toString(16);
    var b = (Math.round(Math.random()* 127) + 127).toString(16);
    return '#' + r + g + b;
}

