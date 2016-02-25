/**
 * Description: Main function
 * @param {trackObject,featureObject,divObject}
 * @returns {container}
 */
function FeatureSeq(track,feature,div){
	console.log("Calling FeatureSeq"); //TWS DEBUG

/*
    var geneid = feature.get('id');
    var uniqueid = feature._uniqueID;
    var type = feature.get('type');
    var description = feature.get('Description');
    var strand = feature.get('strand');
    var chr = feature.get('seq_id');
    var fstart = feature.get('start');
    var fend = feature.get('end');
	
	var direction = strand == '-1' ? "reverse" : "forward";
*/

	var container = container || dojo.create('div', {
		id: "FeatureSeq_container", 
		className: 'sequenceViewerContainer', 
		innerHTML: '' 
	});
	var button_container = dojo.create('div', {
		id: 'button_container',
		className: 'sequenceViewer_topFields' 
	}, container );
	dojo.create('table', { id: "button_meta_table" }, button_container );
    dojo.create( 'div', { id: "seq_display", innerHTML: ''},container);

	Display(track,feature);

/*

    var container = container || dojo.create('div', { className: 'sequenceViewerContainer', innerHTML: '' });
    var title_container = dojo.create('div', { className: 'sequenceViewer_header', innerHTML: '<img src="plugins/SeqLighter/img/seqlighter_logo.png" height="35px">'}, container );
    var user_guide = dojo.create('div', { className: 'sequenceViewer_helpguide', innerHTML: '<a href="plugins/SeqLighter/docs/SeqLighter_v1.0_UserGuide.pdf"><img src="plugins/SeqLighter/img/qmark.jpg">&nbsp;User Guideline</a>'}, title_container );
    var field_container = dojo.create('div', { className: 'sequenceViewer_topFields' }, container );
    var table_container = dojo.create('div', { className: 'sequenceViewer_tableContainer'}, field_container );
    var metaTable = dojo.create('table', { className: 'field_metadata_table'}, table_container );
    var r1 = dojo.create('tr', { className:'oddRow',innerHTML: '<td><b>Name</b></td><td>'+geneid+'</td>' }, metaTable );
    var r2 = dojo.create('tr', { className:'evenRow',innerHTML: '<td><b>Type</b></td><td>'+type+'</td>' }, metaTable );
    var r3 = dojo.create('tr', { className:'oddRow',innerHTML: '<td><b>Description</b></td><td>'+description+'</td>' }, metaTable );
    var r4 = dojo.create('tr', { className:'evenRow',innerHTML: '<td><b>Location</b></td><td>'+chr+':'+fstart+'-'+fend+'</td>' }, metaTable );
    var r5 = dojo.create('tr', { className:'oddRow',innerHTML: '<td><b>Strand</b></td><td>'+direction+'</td>' }, metaTable );
    var legend_container = dojo.create('div',{className:'sequenceViewer_legendContainer'}, field_container );
	
	//Create sequence div
    dojo.create( 'div', { id: "seq_display", innerHTML: ''},container);

	//Create display
    Display(track,feature,legend_container,container);

*/

	//Start popup scrolled to the top
	container.scrollIntoView();

    return container;

}

/**
 * Title: Display
 * Description: Main driver for displaying sequence
 */
function Display(track,feature){

	console.log("Calling Display"); //TWS DEBUG
    var start_coord = feature.get('start');
    var end_coord = feature.get('end');
    var strand = feature.get('strand');
    var feat_id = feature.get('id');
    var targetSeqLen= end_coord - start_coord;

	var subf_byType = getSubFeats(feature); 

    track.store.args.browser.getStore('refseqs', dojo.hitch(this,function( refSeqStore ) {

	if( refSeqStore ) {

	    refSeqStore.getReferenceSequence(
//		{ ref: track.store.args.browser.refSeq.name, start: start_coord-4000, end: end_coord+4000},
		{ ref: track.store.args.browser.refSeq.name, start: start_coord, end: end_coord}, //TWS DEBUG

		dojo.hitch( this, function ( seq ){

		    if(strand == '-1'){
				seq = revcom(seq);
		    }

/*
		    var targetSeq = seq.substr(4000,targetSeqLen);
		    var BioJsObject = new Biojs.Sequence({
				sequence : seq,
				target : "test_mk1",
				format : 'FASTA',
				id : feat_id,
				annotations: [],
				highlights : [],
				formatSelectorVisible: true
		    });

			extendFxn(BioJsObject);

			BioJsObject.opt['subfeats'] = subf_byType;

			//console.log(BioJsObject); //TWS debug
		    window.featid = feat_id;
		    //var revseq = revcom(targetSeq);
*/

///* TWS begin
			var BioJsObject = {"opt": { "sequence": seq, "id": feat_id, "target": "seq_display", "subfeats" : subf_byType}, "__proto__": {}};
			extendFxn(BioJsObject);

//*/ //TWS end

			for (var subf_type in subf_byType) {
				createButtons(BioJsObject, subf_type);
			}

		    var bufferValue = 0;

			var flankingRegionSelect = new dijit.form.Select({
		        name: "FlankingRegion",
				id: "FlankingRegion",
		        options: [
				    { label: "Select bufffer", value: "0" , selected:true},
		            { label: "500 bp", value: "500" },
		            { label: "1000 bp", value: "1000"},
		            { label: "2000 bp", value: "2000" },
		            { label: "3000 bp", value: "3000" },
		            { label: "4000 bp", value: "4000" },
				]
		    });

    		flankingRegionSelect.placeAt('button_container', 'last');

			BioJsObject._twsDrawFasta();

//			DrawFasta(BioJsObject);
			
		})
	    );
	}
    }));
}

/**
 * Title: displayOpt
 * Description: Create drop-down menu of display options for subfeature type
 * @param {subf_type(String)}
 * @returns {subfeat_objects(Array), subfeatureTypes(Array)} //TWS FIXME
 */
function createButtons (BioJsObject, subf_type) {

	console.log("Calling createButtons"); //TWS DEBUG

	//Create a div for this subf_type's buttons
	dojo.create('tr', { id: subf_type+'_button_row', className:'oddRow',innerHTML: '<td><b>'+subf_type+'s'+'</b></td>' }, 'button_meta_table' );

	var subfArray = BioJsObject.opt.subfeats[subf_type]; //current subfeature array

    var highlightButton = new dijit.form.ToggleButton({
		id: subf_type+"highlight",
		checked: false,
		//iconClass: "dijitCheckBoxIcon",
		label: 'Highlight',
		onChange: function(){
			if (this.checked) {
				this.set('label', 'Unhighlight');
				for ( var i = 0; i < subfArray.length; i++){
					BioJsObject._addHighlight(subfArray[i]);
					//console.log(BioJsObject); TWS DEBUG
				}
			}
			else {
				this.set('label', 'Highlight');
				for ( var i = 0; i < subfArray.length; i++){
					BioJsObject._removeHighlight(subfArray[i]);
				}
			}
		}
	});

	dojo.addClass(highlightButton.domNode, "highlightButton");

	var hideShowButton = new dijit.form.ToggleButton({
		id: subf_type+"hide",
		checked: false,
		//iconClass: "dijitCheckBoxIcon",
		label: 'Hide',
		onChange: function(){
			if (this.checked) {
				for ( var i = 0; i < subfArray.length; i++){
					BioJsObject._addHidden(subfArray[i]);
				}
				this.set('label', 'Show');
			}
			else {
				for ( var i = 0; i < subfArray.length; i++){
					BioJsObject._removeHidden(subfArray[i]);
				}
				this.set('label', 'Hide');
			}
		}
	});

	var textCaseButton = new dijit.form.ToggleButton({
		id: subf_type+"Lowercase",
		checked: false,
		//iconClass: "dijitCheckBoxIcon",
		label: 'Lowercase',
		onChange: function(){
			if (this.checked) {
				for ( var i = 0; i < subfArray.length; i++){
					BioJsObject._addLowercase(subfArray[i]);
				}
				this.set('label', 'Uppercase');
			}
			else {
				for ( var i = 0; i < subfArray.length; i++){
					BioJsObject._removeLowercase(subfArray[i]);
				}
				this.set('label', 'Lowercase');
			}
		}
	});

    highlightButton.placeAt(subf_type+'_button_row');
	hideShowButton.placeAt(subf_type+'_button_row');
	textCaseButton.placeAt(subf_type+'_button_row');

}

/**
 * Title: extendFxn
 * Description: Extend functionality of BioJsObject
 * @param {BioJsObject(Object)}
 * @returns {}
 */
function extendFxn (BioJsObject) {
	//BioJsObject['_contentDiv'] = jQuery( "#" + BioJsObject.opt.target);
	BioJsObject['_contentDiv'] = dojo.query( "#" + BioJsObject.opt.target);
	BioJsObject['_hidden'] = [];
	BioJsObject['_highlighted'] = [];
	BioJsObject['_lowercase'] = [];

	BioJsObject.__proto__['_addHidden'] = function(hidden) {this._hidden.push(hidden); this._applyHidden(hidden);};

	BioJsObject.__proto__['_applyHidden'] = function(h) {

		dojo.query('.sequence').forEach(function(node,index) {
			if (index >= h.start && index < h.end) {
				console.log(index); //TWS DEBUG
				node.style.display = "none";
			}
		});
	};
	BioJsObject.__proto__['_removeHidden'] = function(h) {		
		dojo.query('.sequence').forEach(function(node,index) {
			if (index >= h.start && index < h.end) {
				node.style.display = "inline";
			}
		});
	};
/*
	BioJsObject.__proto__['_applyHidden'] = function(h) {		
		var seq = this._contentDiv.find('.sequence');
		for ( var i = h.start - 1; i < h.end; i++ ){
			jQuery(seq[i])
				.css({ 
					"display" : "none"
					})
				.addClass("hidden");
		}
	};
	BioJsObject.__proto__['_removeHidden'] = function(h) {		
		var seq = this._contentDiv.find('.sequence');
		for ( var i = h.start - 1; i < h.end; i++ ){
			jQuery(seq[i])
				.css({ 
					"display" : "inline"
					})
				.removeClass("hidden");
		}
	};
*/
	BioJsObject.__proto__['_addHighlight'] = function(highlight) {
		this._highlighted.push(highlight);
		this._applyHighlight(highlight);
	};
	BioJsObject.__proto__['_applyHighlight'] = function(h) {
		dojo.query('.sequence').forEach(function(node,index) {
			if (index >= h.start && index < h.end) {
				dojo.addClass( node, 'highlighted');
			}
			//if (index == 1) {console.log(node);} //TWS DEBUG
		});
	};
	BioJsObject.__proto__['_removeHighlight'] = function(h) {
		//console.log('_removeHighlight called. Here is the highlight obj');	//TWS DEBUG
		//console.log(h); //TWS DEBUG
		dojo.query('.sequence').forEach(function(node,index,arr) {
			if (index == 1) { console.log(arr[index]);} //TWS DEBUG
			//console.log('foreach loop within _removeHighlight'); //TWS DEBUG
			if (index >= h.start && index < h.end) {
				//console.log("Should be highlighting now.");
				dojo.removeClass( node, 'highlighted');
			}
			//if (index == 1) { console.log(node.style.background);} //TWS DEBUG
		});
	};

	BioJsObject.__proto__['_addLowercase'] = function(lower) {
		this._lowercase.push(lower);
		this._applyLowercase(lower);
	};
	BioJsObject.__proto__['_applyLowercase'] = function(l) {		
		dojo.query('.sequence').forEach(function(node,index) {
			if (index >= l.start && index < l.end) {
				var base = node.innerHTML.toLowerCase();
				node.innerHTML = base;
			}
		});
	};
	BioJsObject.__proto__['_removeLowercase'] = function(l) {		
		dojo.query('.sequence').forEach(function(node,index) {
			if (index >= l.start && index < l.end) {
				var base = node.innerHTML.toUpperCase();
				node.innerHTML = base;
			}
		});
	};

	BioJsObject.__proto__['_twsDrawFasta'] = function() {
		console.log("Calling twsDrawFasta"); //TWS debug

		var arr = this.opt.sequence.toUpperCase().split('');

		this._container = dojo.query( "#" + this.opt.target )[0];
		var seqBox = dojo.create('div', { 
			className: 'sequence_box',
			innerHTML: '<span class="sequence_title">'+'&gt' + this.opt.id + ' '+arr.length+' '+'bp'+'</span><br>'
		}, this._container);

		for (var i=0; i < arr.length; i++) {
			dojo.create('span', {id: this.opt.id+'_'+i, className: 'sequence', innerHTML: arr[i]}, seqBox);
		}
	};
}

/**
 * Title: getSubFeats
 * Description: Convert subfeatures array into several arrays sorted by type
 * Note: Subfeature coordinates are relative to feature start. In the case of this plugin, 
 * it does not matter if subfeature 2 has coordinates lower than subfeature 1, as we don't
 * distinguish between the individual subfeatures. Consistent coordinate system is the most important.
 *
 * @param {feature(Object)}
 * @returns {arraysByType(Object)}
 */
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

		//TWS LEFT OFF HERE 2-11-16, subfeature coordinates are jacked up
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
 * Complement a sequence and reverse).
 * @param {String} seqString sequence
 * @returns {String} reverse complementedsequence
 */
function revcom(seq) {

	console.log("Calling revcom"); //TWS DEBUG
    var compl_rx   = /[ACGT]/gi;
    var compl_tbl  = {"S":"S","w":"w","T":"A","r":"y","a":"t","N":"N","K":"M","x":"x","d":"h","Y":"R","V":"B","y":"r","M":"K","h":"d","k":"m","C":"G","g":"c","t":"a","A":"T","n":"n","W":"W","X":"X","m":"k","v":"b","B":"V","s":"s","H":"D","c":"g","D":"H","b":"v","R":"Y","G":"C"};

    var nbsp = String.fromCharCode(160);
    var compl_func = function(m) { return compl_tbl[m] || nbsp; };

    var compl_seq = seq.replace( compl_rx, compl_func );
    var revseq = compl_seq.split('').reverse().join('');

    return revseq;
}

//TWS Debug - Shuffle fxn to test sorting
function shuffle(array) {

	console.log("calling shuffle"); //TWS DEBUG
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
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

