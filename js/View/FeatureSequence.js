define([
           'dojo/_base/declare',
           'dojo/_base/array',
           'dojo/_base/lang',
		   'dojo/dom-construct',
		   'dojo/dom-class',
           'dojo/dom-style',
		   'dojo/query',
           'dijit/Dialog'
       ],
       function(
           declare,
           array,
           lang,
		   domConstruct,
		   domClass,
           domStyle,
		   query,
           Dialog
       ) {
return declare( null,
{
    feature: -1,
    seq: -1,

    constructor: function(feature, seq, opt){
        var self = this;
        console.log("Calling FeatureSequence"); //TWS DEBUG
        this.feature = feature;
        this.seq = seq;
        this.opt = opt;
        this.subf_byType = getSubFeats(feature);
        this._hidden = [];
        this._highlighted = [];
        this._lowercase = [];
        //console.log(opt.divName); //TWS DEBUG
        //this._sequenceDiv = query( "#" + opt.seqDivName );

        this._initialize(self);

    },

    _initialize: function(self) {
        console.log("Calling initialize"); //TWS DEBUG
        var container = dojo.create('div', {
    		//id: "FeatureSeq_container", 
	    	className: 'FeatureSequenceContainer', 
	    	innerHTML: '' 
	    });

        //self._container = container;

	    var button_container = dojo.create('div', {
	    	//id: 'button_container',
	    	className: 'button_container' 
	    }, container );
	    var metaTable = dojo.create('table', { 
            //id: "button_meta_table",
            className: 'button_meta_table' }, button_container );
        dojo.create( 'div', {
            //id: "seq_display",
            className: "seq_display",
            innerHTML: ''
        },container);

        Object.keys(self.subf_byType).forEach(function(type){

            //var subfArray = self.subf_byType[index];

            var row = dojo.create('tr', {
                //id: type+'_buttonRow',
                className:'buttonRow',
                innerHTML: '<td><b>'+type+'s'+'</b></td>'
            }, metaTable );

            var highlightButton = new dijit.form.ToggleButton({
		        //id: type+"_highlightButton",
                className: 'highlightButton',
		        checked: false,
    		    //iconClass: "dijitCheckBoxIcon",
	    	    label: 'Highlight',
		        onChange: function(){
			        if (this.checked) {
                        var colorstr = pastelColors();
				        this.set('label', 'Unhighlight');
				        self.subf_byType[type].forEach(function(highlight) {
                            //highlight.color = pastelColors();
                            highlight.color = colorstr;
                            self._addHighlight(highlight);
                        });
/*
                        for ( var i = 0; i < subfArray.length; i++){
					        self._addHighlight(subfArray[i]);
					        //console.log(BioJsObject); TWS DEBUG
				        }
*/
			        }
			        else {
				        this.set('label', 'Highlight');
				        self.subf_byType[type].forEach(function(highlight) {
                            self._removeHighlight(highlight);
                        });

/*
				        for ( var i = 0; i < subfArray.length; i++){
					        self._removeHighlight(subfArray[i]);
				        }
*/
			        }
		        }
    	    });

	        //dojo.addClass(highlightButton.domNode, "highlightButton");

	        var hideShowButton = new dijit.form.ToggleButton({
		        //id: type+"hide",
                className: 'hideButton',
		        checked: false,
		        //iconClass: "dijitCheckBoxIcon",
		        label: 'Hide',
                onChange: function(){
			        if (this.checked) {
				        self.subf_byType[type].forEach(function(hidden) {
                            self._addHidden(hidden);
                        });
/*
				        for ( var i = 0; i < subfArray.length; i++){
					        BioJsObject._addHidden(subfArray[i]);
				        }
*/
				        this.set('label', 'Show');
			        }
			        else {
				        self.subf_byType[type].forEach(function(hidden) {
                            self._removeHidden(hidden);
                        });
/*
				        for ( var i = 0; i < subfArray.length; i++){
					        BioJsObject._removeHidden(subfArray[i]);
				        }
*/
				        this.set('label', 'Hide');
			        }
		        }
	        });

	        var textCaseButton = new dijit.form.ToggleButton({
		        //id: type+"Lowercase",
                className: 'lowercaseButton',
		        checked: false,
		        //iconClass: "dijitCheckBoxIcon",
		        label: 'Lowercase',
		        onChange: function(){
			        if (this.checked) {
				        self.subf_byType[type].forEach(function(lower) {
                            self._addLowercase(lower);
                        });
/*
				        for ( var i = 0; i < subfArray.length; i++){
					        BioJsObject._addLowercase(subfArray[i]);
				        }
*/
				        this.set('label', 'Uppercase');
			        }
			        else {
				        self.subf_byType[type].forEach(function(lower) {
                            self._removeLowercase(lower);
                        });
/*
				        for ( var i = 0; i < subfArray.length; i++){
					        BioJsObject._removeLowercase(subfArray[i]);
				        }
*/
				        this.set('label', 'Lowercase');
			        }
		        }
	        });

            //console.log(highlightButton);
            highlightButton.placeAt(row);
	        hideShowButton.placeAt(row);
	        textCaseButton.placeAt(row);

        });

        var seqBox = this._DrawFasta();

        domConstruct.place(seqBox,container);

        var myDialog = new Dialog({
            title: "FeatureSequence Viewer",
            content: container,
            onHide: function() {
                myDialog.destroy()
            }
        });

        console.log("Calling myDialog.show()");
        myDialog.show();

        //this._contentDiv = container;
    },

	_addHidden: function(hidden) {
        this._hidden.push(hidden); 
        this._applyHidden(hidden);
    },

	_applyHidden: function(h) {

		dojo.query('.sequence').forEach(function(node,index) {
			if (index >= h.start && index < h.end) {
				//console.log(index); //TWS DEBUG
				node.style.display = "none";
			}
		});
	},

	_removeHidden: function(h) {		
		dojo.query('.sequence').forEach(function(node,index) {
			if (index >= h.start && index < h.end) {
				node.style.display = "inline";
			}
		});
	},

    _addHighlight: function(highlight) {
		this._highlighted.push(highlight);
		this._applyHighlight(highlight);
	},

    _applyHighlight: function(h) {
        //console.log(h); //TWS DEBUG
		dojo.query('.sequence').forEach(function(node,index) {
			if (index >= h.start && index < h.end) {
                //console.log(node);
                domStyle.set(node, "background-color", h.color);
				//dojo.addClass( node, 'highlighted');
			}
			//if (index == 1) {console.log(node);} //TWS DEBUG
		});
	},

	_removeHighlight: function(h) {
		//console.log('Calling _removeHighlight');	//TWS DEBUG
		//console.log(h); //TWS DEBUG
		dojo.query('.sequence').forEach(function(node,index,arr) {
			//if (index == 1) { console.log(arr[index]);} //TWS DEBUG
			//console.log('foreach loop within _removeHighlight'); //TWS DEBUG
			if (index >= h.start && index < h.end) {
                domStyle.set(node, "background-color", "#FFF");                
				//dojo.removeClass( node, 'highlighted');
			}
			//if (index == 1) { console.log(node.style.background);} //TWS DEBUG
		});
	},

	_addLowercase: function(lower) {
		this._lowercase.push(lower);
		this._applyLowercase(lower);
	},

	_applyLowercase: function(l) {		
		dojo.query('.sequence').forEach(function(node,index) {
			if (index >= l.start && index < l.end) {
				var base = node.innerHTML.toLowerCase();
				node.innerHTML = base;
			}
		});
	},

	_removeLowercase: function(l) {		
		dojo.query('.sequence').forEach(function(node,index) {
			if (index >= l.start && index < l.end) {
				var base = node.innerHTML.toUpperCase();
				node.innerHTML = base;
			}
		});
	},

    _DrawFasta: function() { //TWS Left off here 2-25-2016 Trying to get twsDrawFasta to work. 
		console.log("Calling twsDrawFasta"); //TWS debug

		var arr = this.seq.target.toUpperCase().split('');

		//var container = query( "#" + this.opt.seqDivName )[0];
		var seqBox = dojo.create('div', { 
			className: 'sequence_box',
			innerHTML: '<span class="sequence_title">'+'&gt' + this.feature.get('id') + ' '+arr.length+' '+'bp'+'</span><br>'
		});

		arr.forEach(function(base,index) {
            //console.log(base); //TWS DEBUG
            var spn = dojo.create('span', {
                //id: 'targetseq_'+index,
                className: 'sequence',
                innerHTML: base});
            domConstruct.place(spn, seqBox);
        
        });

        return seqBox;
/*
        for (var i=0; i < arr.length; i++) {
			dojo.create('span', {id: this.opt.id+'_'+i, className: 'sequence', innerHTML: arr[i]}, seqBox);
		}
*/
	}
            
});
});

function getSubFeats (feature) {

	console.log("Calling getSubFeats"); //TWS DEBUG

	var feature_coords = [feature.get('start'), feature.get('end')];
	feature_coords.sort(function(a,b){return a-b;}); //swap if out of order

	var feature_strand = feature.get('strand');

	//console.log('featStart:'+feature_coords[0]+' featEnd:'+feature_coords[1]) //TWS DEBUG

	var arraysByType = {};
	var subfeatures = feature.get('subfeatures');
	subfeatures.forEach(function(f, ind) {

		var subfeat_coords = [f.get('start'), f.get('end')];
		subfeat_coords.sort(function(a,b){return a-b;}); //swap if out of order

		if (feature_strand == 1) {
			var subf_start = subfeat_coords[0] - feature_coords[0]; //Relative to feature start
			var subf_end = subfeat_coords[1] - feature_coords[0]; //Relative to feature start
		} else if (feature_strand == -1) {
			var subf_start = feature_coords[1] - subfeat_coords[1]; //Relative to feature start
			var subf_end = feature_coords[1] - subfeat_coords[0]; //Relative to feature start
		}

		//console.log('subfStart:'+subfeat_coords[0]+' subfEnd:'+subfeat_coords[1]); //TWS DEBUG
		//console.log('relStart:'+subf_start+' relEnd:'+subf_end); //TWS DEBUG
		var subf_strand = f.get('strand');
		var subf_type = f.get('type');

		var subf_obj = {'start':subf_start, 'end':subf_end, 'strand':subf_strand, 'type':subf_type, 'id': subf_type+'_'+(ind+1)};

		//Create a key for the type value if it doesn't yet exist
		if (!(subf_type in arraysByType)) {
			arraysByType[subf_type] = [];
		}

		//Push subfeature object to appropriate array of subfeatures
		arraysByType[subf_type].push(subf_obj)
	});

	/*
	 * Sort each array of subfeatures by start location
	 * Note: In this plugin, these will be sorted by their order on the reference, 
	 * and therefore negative strand subfeatures might appear to have the wrong biological order
	 */
	for (var type in arraysByType) {
		sortByKey(arraysByType[type], 'start');
	}

	if ('exon' in arraysByType) {
		arraysByType['intron'] = intronsFromExons(arraysByType.exon);
	}
	
	return arraysByType;
}

/**
 * Title: intronsFromExons
 * Description: Create array of introns in between the exons
 * @param {exons(Array)}
 * @returns {introns(Array)}
 */
function intronsFromExons (exons) {

	console.log("Calling intronsFromExons"); //TWS DEBUG
	var intronArray = [];

	for (var i = 0; i < exons.length-1; i++) {

		var intron_start = exons[i].end;
		var intron_end = exons[i+1].start;

		intronArray[i] = {'start':intron_start,'end':intron_end, 'strand':exons[i].strand, 'type':'intron', 'id': 'intron_'+(i+1)};
    }
	
	return intronArray;
}

/**
 * Title: sortByKey
 * Description: Generalized sorting for associative arrays.
 * @param {Array, Key(String)}
 * @returns {Sorted_Array}
 */
function sortByKey(array, key) {

	console.log("Calling sortByKey"); //TWS DEBUG
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];

        if (typeof x == "string")
        {
            x = x.toLowerCase(); 
            y = y.toLowerCase();
        }

        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function pastelColors(){
    var r = (Math.round(Math.random()* 127) + 127).toString(16);
    var g = (Math.round(Math.random()* 127) + 127).toString(16);
    var b = (Math.round(Math.random()* 127) + 127).toString(16);
    return '#' + r + g + b;
}

