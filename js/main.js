define([
           'dojo/_base/declare',
           'dojo/_base/array',
           'dojo/_base/lang',
           'dojo/Deferred',
           'dojo/dom',
		   'dojo/dom-construct',
		   'dojo/dom-class',
		   'dojo/query',
           'JBrowse/Util',
           'JBrowse/Plugin',
            './View/FeatureSequence'
       ],
       function(
           declare,
           array,
           lang,
           Deferred,
           dom,
		   domConstruct,
		   domClass,
		   query,
           Util,
           JBrowsePlugin,
            FeatureSequence
       ) {
return declare( JBrowsePlugin,
{
    constructor: function( args ) {
    
        var thisB = this;
        //console.log(args);

        // do anything you need to initialize your plugin here

		//TWS: Will need to change these to local paths if this works
/*
		[
          'plugins/FeatureSequence/lib/FeatureSequence.js',
          'plugins/SeqLighter/jslib/biojs/src/main/javascript/Biojs.js',
          'plugins/SeqLighter/jslib/biojs/src/main/javascript/Biojs.Tooltip.js',
          'plugins/SeqLighter/jslib/biojs/src/main/javascript/Biojs.Sequence.js',
          'plugins/SeqLighter/jslib/biojs/src/main/resources/dependencies/jquery/jquery-1.4.2.min.js',
          'plugins/SeqLighter/jslib/biojs/src/main/resources/dependencies/jquery/jquery-ui-1.8.2.custom.min.js'
        ].forEach(function(src) {
          var script = document.createElement('script');
          script.src = src;
          script.async = false;
          document.head.appendChild(script);
        });
*/
        console.log( "FeatureSequence plugin initialized." );
    },
        
    testFxn: function(track, feature) {
        console.log("Calling testFxn."); //TWS DEBUG

        var seq = new Deferred(); //TWS Left off here 2-24-2016 Trying to make asynchronous shit work

        var subfeats = feature.get('subfeatures');
        var types = subfeats.map(function(value) { return value.get('type'); }).sort().filter(function(el,i,a){if(i==a.indexOf(el))return 1;return 0});
        //console.log(types); //TWS DEBUG

        //Get sequence and create FeatureSequence
        var buffer = 4000;
        var feature_coords = [feature.get('start'), feature.get('end')];
        feature_coords.sort(function(a,b){return a-b;}); //swap if out of order
        var getStart = feature_coords[0] - buffer;
        var getEnd = feature_coords[1] + buffer;
        var targetSeqLen = feature_coords[1]-feature_coords[0];
        track.store.args.browser.getStore('refseqs', dojo.hitch(this,function( refSeqStore ) {

        	if( refSeqStore ) {
                console.log(instance.foo);
        	    refSeqStore.getReferenceSequence(
//		{ ref: track.store.args.browser.refSeq.name, start: start_coord-4000, end: end_coord+4000},
            		{ ref: track.store.args.browser.refSeq.name, start: getStart, end: getEnd}, //TWS DEBUG
                    dojo.hitch( this, function (fullSeq){
                        if (feature.get('strand') == -1) {
                            fullSeq = Util.revcom(fullSeq);
                        }

                        var seq = {
                            upstream: fullSeq.substr(0,buffer), 
                            target: fullSeq.substr(buffer,targetSeqLen),
                            downstream: fullSeq.substr(-(targetSeqLen+buffer))
                        };

                        //FeatureSequence(feature, sequence, {options})
                        this.FeatSeq = new FeatureSequence(feature, seq, {
                            seqDivName: 'seq_display',
                            hidden: [],
                            highlighted: [],
                            lowercase: []
                        });
                        console.log(this)
                        //FeatSeq.show();
                    })
                );
            }
        })
        );

        //Create divs
        var container = this._createDivs();

        //Create buttons
        this._createButtons(types); //TWS Left off here - this causes errors

        console.log(container);
        return container; //instance.FeatSeq._contentDiv; //dom.byId('FeatureSeq_container');

    },

    _createButtons: function(types_arr) {
        console.log("Calling createButtons"); //TWS DEBUG

        types_arr.forEach(function(type) {
                
            var row = dojo.create('tr', {
                id: type+'_buttonRow',
                className:'oddRow',
                innerHTML: '<td><b>'+type+'s'+'</b></td>'
            }, dom.byId('button_meta_table') );

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

    },

    _createDivs: function() {
        console.log("Calling createDivs"); //TWS DEBUG
        var container = dojo.create('div', {
    		id: "FeatureSeq_container", 
	    	className: 'sequenceViewerContainer', 
	    	innerHTML: '<b>FOO</b>' 
	    });
	    var button_container = dojo.create('div', {
	    	id: 'button_container',
	    	className: 'sequenceViewer_topFields' 
	    }, container );
	    dojo.create('table', { id: "button_meta_table" }, button_container );
        dojo.create( 'div', { id: "seq_display", innerHTML: 'SEQ'},container);
        return container;
    }
	
});
});
