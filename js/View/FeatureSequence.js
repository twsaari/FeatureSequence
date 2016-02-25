define([
           'dojo/_base/declare',
           'dojo/_base/array',
           'dojo/_base/lang',
		   'dojo/dom-construct',
		   'dojo/dom-class',
		   'dojo/query'
       ],
       function(
           declare,
           array,
           lang,
		   domConstruct,
		   domClass,
		   query
       ) {
return declare( null,
{
    feature: -1,
    seq: -1,

    constructor: function(feature, seq, opt){
        console.log("Calling FeatureSequence"); //TWS DEBUG
        this.feature = feature;
        this.seq = seq;
        this.opt = opt;
        this.subf_byType = getSubFeats(feature);
        //console.log(opt.divName); //TWS DEBUG
        //this._sequenceDiv = query( "#" + opt.seqDivName );

        this._initialize();
        console.log(this);
    },

    _initialize: function() {
        console.log("Calling initialize"); //TWS DEBUG
        var container = dojo.create('div', {
    		id: "FeatureSeq_container", 
	    	className: 'sequenceViewerContainer', 
	    	innerHTML: '<b>FOO</b>' 
	    });
	    var button_container = dojo.create('div', {
	    	id: 'button_container',
	    	className: 'sequenceViewer_topFields' 
	    }, container );
	    var metaTable = dojo.create('table', { id: "button_meta_table" }, button_container );
        dojo.create( 'div', { id: "seq_display", innerHTML: 'SEQ'},container);


        this.subf_byType.forEach(function(type){

            var row = dojo.create('tr', {
                id: type+'_buttonRow',
                className:'oddRow',
                innerHTML: '<td><b>'+type+'s'+'</b></td>'
            }, metaTable );

            var highlightButton = new dijit.form.ToggleButton({
		        id: type+"_highlightButton",
		        checked: false,
    		    //iconClass: "dijitCheckBoxIcon",
	    	    label: 'Highlight'
    	    });

	        //dojo.addClass(highlightButton.domNode, "highlightButton");

	        var hideShowButton = new dijit.form.ToggleButton({
		        id: type+"hide",
		        checked: false,
		        //iconClass: "dijitCheckBoxIcon",
		        label: 'Hide'
	        });

	        var textCaseButton = new dijit.form.ToggleButton({
		        id: type+"Lowercase",
		        checked: false,
		        //iconClass: "dijitCheckBoxIcon",
		        label: 'Lowercase'
	        });

            highlightButton.placeAt(row);
	        hideShowButton.placeAt(row);
	        textCaseButton.placeAt(row);

        });

        this._contentDiv = container;
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

		var subf_obj = {'start':subf_start, 'end':subf_end, 'strand':subf_strand, 'type':subf_type, 'id': subf_type+ind};

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

		intronArray[i] = {'start':intron_start,'end':intron_end, 'strand':exons[i].strand, 'type':'intron', 'id': 'intron'+i};
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
