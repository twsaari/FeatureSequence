define([
           'dijit/Dialog',
           'dojo/_base/declare',
           'dojo/_base/array',
           'dojo/_base/lang',
           'dojo/Deferred',
           'dojo/DeferredList',
           'dojo/dom',
           'dojo/dom-construct',
		   'dojo/dom-class',
		   'dojo/query',
           'JBrowse/Util',
           'JBrowse/Plugin',
           './View/FeatureSequence'
       ],
       function(
           Dialog,
           declare,
           array,
           lang,
           Deferred,
           DeferredList,
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

        // do anything you need to initialize your plugin here

        console.log( "FeatureSequence plugin initialized." );
    },

    /**
     * Title: callFxn
     * Description: Creates deferred feature and sequence objects 
     * pulling information from JBrowse objects. Then creates a FeatureSequence 
     * from the resolved objects.
     *
     * @param {track (jbrowse object), feature (jbrowse object)}
     * @returns { '' (empty string) }
     */
    callFxn: function(track, feature) {
        //console.log("Calling callFxn."); //TWS DEBUG

        var seq_deferred = this._getSequence(track,feature);
        var feat_deferred = this._getFeatureAttr(feature);      

        var dfList = new DeferredList([feat_deferred,seq_deferred]);  
        
        //After dfList is resolved, create a new FeatureSequence
        dfList.then(function(results){
/*
            console.log(results[0][1]); //feat
            console.log(results[1][1]); //seq
            //To export the FeatureSequence object in JSON, uncomment the following:
            //alert(JSON.stringify([results[0][1], results[1][1], {seqDivName: 'seq_display'}]));
*/

            var FeatSeq = new FeatureSequence(results[0][1], results[1][1], {
                seqDivName: 'seq_display'
            });

        });

        return '';
    },

    /**
     * Title: _getSequence
     * Description: Gets sequence from track store, and creates a deferred
     * seq object for input into a new FeatureSequence. 
     * Also includes 4k bp upstream and downstream
     *
     * @param {track (jbrowse object), feature (jbrowse object)}
     * @returns { seqDeferred.promise (sequence object promise)}
     */
    _getSequence: function( track, feature) {
        //console.log("Calling getSequence"); //TWS DEBUG

        var seqDeferred = new Deferred();

        var buffer = 4000;
        var feature_coords = [feature.get('start'), feature.get('end')].sort(function(a,b){return a-b;}); //swap if out of order;
        var getStart = feature_coords[0] - buffer;
        var getEnd = feature_coords[1] + buffer;
        var targetSeqLen = feature_coords[1]-feature_coords[0];

        track.store.args.browser.getStore('refseqs', dojo.hitch(this,function( refSeqStore ) {

        	if( refSeqStore ) {
        	    refSeqStore.getReferenceSequence(
              	    { ref: track.store.args.browser.refSeq.name, start: getStart, end: getEnd}, 
                        dojo.hitch( this, function (fullSeq){
                            if (feature.get('strand') == -1) {
                                fullSeq = Util.revcom(fullSeq);
                            }

                            var seq_obj = {
                                upstream: fullSeq.substr(0,buffer), 
                                target: fullSeq.substr(buffer,targetSeqLen),
                                downstream: fullSeq.substr(targetSeqLen+buffer)
                            };

                            seqDeferred.resolve(seq_obj);                        

                        })
                    );
                }
            })
            );

        return seqDeferred.promise;
    },

    /**
     * Title: _getFeatAttr
     * Description: Gets feature main attributes and subfeatures from jbrowse object
     * and creates a deferred feature object for input into a new FeatureSequence
     * @param {feature (jbrowse object)}
     * @returns { featDeferred.promise (feature object promise)}
     */
    _getFeatureAttr: function (feature) {
        //console.log("Calling _getFeatureAttr"); //TWS DEBUG
        var featDeferred = new Deferred();
        var featAttr = { 
            _id: feature.get('id'),
            _start: feature.get('start'),
            _end: feature.get('end'),
            _strand: feature.get('strand'),
            subf_byType: this._getSubFeats(feature)
        };
        
        featDeferred.resolve(featAttr);
        return featDeferred.promise;
    },
        

    /**
     * Title: _getSubFeats
     * Description: Creates a subf_byType object containing arrays of subfeatures,
     *  with each type of subfeature in a separate array
     * @param {feature (jbrowse object)}
     * @returns {subf_byType (FeatureSequence object)}
     */
    _getSubFeats: function (feature) {
	    //console.log("Calling getSubFeats"); //TWS DEBUG

	    var feature_coords = [feature.get('start'), feature.get('end')]
            .sort(function(a,b){return a-b;}); //swap if out of order

	    var feature_strand = feature.get('strand');

	    var arraysByType = {};
	    var subfeatures = feature.get('subfeatures');
	    subfeatures.forEach(function(f, ind) {

		    var subfeat_coords = [f.get('start'), f.get('end')]
                .sort(function(a,b){return a-b;}); //swap if out of order

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
		    this.sortByKey(arraysByType[type], 'start');
	    }

        //if type exon exists, create corresponding introns
	    if ('exon' in arraysByType) {
		    arraysByType['intron'] = this.intronsFromExons(arraysByType.exon);
	    }
	
	    return arraysByType;
    },

    /**
     * Title: intronsFromExons
     * Description: Create array of introns in between the exons
     * @param {exons(Array)}
     * @returns {introns(Array)}
     */
    intronsFromExons: function (exons) {

	    //console.log("Calling intronsFromExons"); //TWS DEBUG
	    var intronArray = [];

	    for (var i = 0; i < exons.length-1; i++) {

		    var intron_start = exons[i].end;
		    var intron_end = exons[i+1].start;

		    intronArray[i] = {'start':intron_start,'end':intron_end, 'strand':exons[i].strand, 'type':'intron', 'id': 'intron_'+(i+1)};
        }
	
	    return intronArray;
    },

    /**
     * Title: sortByKey
     * Description: Generalized sorting for associative arrays.
     * @param {Array, Key(String)}
     * @returns {Sorted_Array}
     */
    sortByKey: function (array, key) {

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
            
});
});
