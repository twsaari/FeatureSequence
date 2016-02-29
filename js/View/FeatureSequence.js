define([
           'dojo/_base/declare',
           'dojo/_base/array',
           'dojo/_base/lang',
		   'dojo/dom-construct',
		   'dojo/dom-class',
           'dojo/dom-style',
		   'dojo/query',
           'dijit/form/ToggleButton',
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
           ToggleButton
           Dialog
       ) {
return declare( null,
{
    feature: -1,
    seq: -1,

    constructor: function(feature, seq, opt){
        var self = this;
        //console.log("Calling FeatureSequence"); //TWS DEBUG
        this.feature = feature;
        this.seq = seq;
        this.opt = opt;
        this.subf_byType = getSubFeats(feature);
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

        Object.keys(self.subf_byType).forEach(function(type){

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
				        self.subf_byType[type].forEach(function(highlight) {
                            highlight.color = colorstr;
                            self._addHighlight(highlight);
                        });
			        }
			        else {
				        this.set('label', 'Highlight');
				        self.subf_byType[type].forEach(function(highlight) {
                            self._removeHighlight(highlight);
                        });
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
				        self.subf_byType[type].forEach(function(hidden) {
                            self._addHidden(hidden);
                        });
				        this.set('label', 'Show');
			        }
			        else {
				        self.subf_byType[type].forEach(function(hidden) {
                            self._removeHidden(hidden);
                        });
				        this.set('label', 'Hide');
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
				        self.subf_byType[type].forEach(function(lower) {
                            self._addLowercase(lower);
                        });
				        this.set('label', 'Uppercase');
			        }
			        else {
				        self.subf_byType[type].forEach(function(lower) {
                            self._removeLowercase(lower);
                        });
				        this.set('label', 'Lowercase');
			        }
		        }
	        });

            highlightButton.placeAt(highlight_td);
	        hideShowButton.placeAt(hideShow_td);
	        textCaseButton.placeAt(textCase_td);

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

        //console.log("Calling myDialog.show()");
        myDialog.show();

    },

	_addHidden: function(hidden) {
        this._hidden.push(hidden); 
        this._applyHidden(hidden);
    },

	_applyHidden: function(h) {

		dojo.query('.sequence').forEach(function(node,index) {
			if (index >= h.start && index < h.end) {
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
		dojo.query('.sequence').forEach(function(node,index) {
			if (index >= h.start && index < h.end) {
                domStyle.set(node, "background-color", h.color);
			}
		});
	},

	_removeHighlight: function(h) {
		dojo.query('.sequence').forEach(function(node,index,arr) {
			if (index >= h.start && index < h.end) {
                domStyle.set(node, "background-color", "#FFF");
			}
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

    _DrawFasta: function() {
		//console.log("Calling DrawFasta"); //TWS debug

		var arr = this.seq.target.toUpperCase().split('');

		var seqBox = dojo.create('div', { 
			className: 'sequence_box',
			innerHTML: '<span class="sequence_title">'+'&gt' + this.feature.get('id') + '</span><br>'
			//innerHTML: '<span class="sequence_title">'+'&gt' + this.feature.get('id') + ' '+arr.length+' '+'bp'+'</span><br>'
		});

		arr.forEach(function(base,index) {
            var spn = dojo.create('span', {
                //id: 'targetseq_'+index,
                className: 'sequence',
                innerHTML: base});
            domConstruct.place(spn, seqBox);
        
        });

        return seqBox;

	}
            
});
});

/**
 * Title: getSubFeats
 * Description: Creates a subf_byType object containing arrays of subfeatures,
 *  with each type of subfeature in a separate array
 * @param {feature (jbrowse object)}
 * @returns {subf_byType (FeatureSequence object)}
 */
function getSubFeats (feature) {

	//console.log("Calling getSubFeats"); //TWS DEBUG

	var feature_coords = [feature.get('start'), feature.get('end')]
        .sort(function(a,b){return a-b;}); //swap if out of order

	//feature_coords.sort(function(a,b){return a-b;});

	var feature_strand = feature.get('strand');

	var arraysByType = {};
	var subfeatures = feature.get('subfeatures');
	subfeatures.forEach(function(f, ind) {

		var subfeat_coords = [f.get('start'), f.get('end')]
            .sort(function(a,b){return a-b;}); //swap if out of order

		//subfeat_coords.sort(function(a,b){return a-b;});

        //All coordinates are made relative to feature start
		if (feature_strand == 1) {
			var subf_start = subfeat_coords[0] - feature_coords[0]; 
			var subf_end = subfeat_coords[1] - feature_coords[0]; 
		} else if (feature_strand == -1) {
			var subf_start = feature_coords[1] - subfeat_coords[1];
			var subf_end = feature_coords[1] - subfeat_coords[0];
		}

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

    //Sort by start location note that these coordinates are relative
	for (var type in arraysByType) {
		sortByKey(arraysByType[type], 'start');
	}

    //if type exon exists, create corresponding introns
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

	//console.log("Calling intronsFromExons"); //TWS DEBUG
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

	//console.log("Calling sortByKey"); //TWS DEBUG
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

