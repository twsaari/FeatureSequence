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
           './View/FeatureSequenceOld',
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
           FeatureSequenceOld,
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
     * TWS FIXME: Possible to return the FeatureSequence container? This would 
     * give FeatureSequence content directly to contentDialog launched from
     * the right-click menu
     *
     * @param {track (jbrowse object), feature (jbrowse object)}
     * @returns { 'Foo' (string) }
     */
    callFxn: function(track, feature) {
        //console.log("Calling callFxn."); //TWS DEBUG

        var seq_deferred = this._getSequence(track,feature);
        var feat_deferred = this._getFeatureAttr(feature);      

        var dfList = new DeferredList([feat_deferred,seq_deferred]);  
        
        //After dfList is resolved, create a new FeatureSequence
        dfList.then(function(results){

            var feat = results[0][1];
            var seq = results[1][1];
            var opt = {seqDivName: 'seq_display'};

            //To export the FeatureSequence object in JSON, uncomment the following:
/*
            var foo = new Dialog({
                title: 'FeatureSequence JSON Export',
                content: JSON.stringify([feat,seq,opt]),
                onHide: function () {
                    foo.destroy();
                }
            });
            foo.show();
*/

        /**
         * Overlapping subfeatures will interfere with the use of FeatureSequence.
         * An older method will more accurately display overlapping features, 
         * but this will suffer a major performance penalty.
         */
            if ( checkForOverlap(feat._subfeatures) === -1 ) {
                var FeatSeq = new FeatureSequence(feat, seq, opt);
            } else {
                var FeatSeq = new FeatureSequenceOld(feat, seq, opt);
            }

        });

        return 'Thank you for using the FeatureSequence plugin';
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
    _getSequence: function(track, feature) {
        //console.log("Calling getSequence"); //TWS DEBUG

        var seqDeferred = new Deferred();

        var buffer = 4000;
        var feature_coords = [feature.get('start'), feature.get('end')].sort(function(a,b){return a-b;}); //swap if out of order;
        var getStart = feature_coords[0] - buffer;
        var getEnd = feature_coords[1] + buffer;
        var targetSeqLen = feature_coords[1]-feature_coords[0];

        var getStoreName = function (cache){
            var myName = '';
            for (var cachedStore in cache) {
                var attr = cache[cachedStore].store;
                //console.log(attr.name);
                if (attr.hasOwnProperty('fasta') && attr.hasOwnProperty('name')){
                    myName = attr.name;
                    //console.log(attr.name+" is your indexed_fasta store!");
                }else if (attr.hasOwnProperty('name') && attr.name === 'refseqs') {
                    myName = attr.name;
                }
            }

            return myName.length > 0 ? myName : 'no_store_found';
        };

        var sequenceStore = getStoreName(track.browser._storeCache);

        track.store.args.browser.getStore(sequenceStore, dojo.hitch(this,function( refSeqStore ) {

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

        var subfeats = this._getSubFeats(feature);
        var types = this._getTypes(subfeats);

        var featAttr = { 
            _id: feature.get('name') || feature.get('name') || feature.get('id') || '>No_name' ,
            _absCoords: {start: feature.get('start'), end: feature.get('end')},
            _relCoords: {start: 0, end: Math.abs(feature.get('end') - feature.get('start'))},
            _strand: feature.get('strand'),
            _subfeatures: subfeats,
            _types: types
        };
        
        featDeferred.resolve(featAttr);
        return featDeferred.promise;
    },
        

    /**
     * Title: _getSubFeats
     * Description: Creates a sorted array of subfeatures,
     *  with all of the information needed for FeatureSequence
     * @param {feature (jbrowse object)}
     * @returns {subfeatures (Array)}
     */
    _getSubFeats: function (feature) {
	    //console.log("Calling getSubFeats"); //TWS DEBUG

	    var feature_coords = [feature.get('start'), feature.get('end')]
            .sort(function(a,b){return a-b;}); //swap if out of order

	    var feature_strand = feature.get('strand');

        var types = [];
        var subfeatures = [];

	    feature.get('subfeatures').forEach(function(f, ind) {

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

            //Push subf_type to types array if not seen yet
            if (array.indexOf(types, subf_type) === -1 ) {
                types.push(subf_type)
            }

            subfeatures.push(subf_obj)

	    });

        //Create introns from exon or CDS features if necessary
        if (array.indexOf(types, 'intron') === -1) {

            if (array.indexOf(types, 'exon') >= 0) {

                //console.log("Exons found. Going to create introns"); //TWS DEBUG
                var exons = array.filter(subfeatures, function (obj) {
                    return obj.type === 'exon';
                });

                this.sortByKey(exons, 'start');
                subfeatures = subfeatures.concat(this.intronsFromExons(exons));

            } else if (array.indexOf(types, 'CDS') >= 0) {

                //console.log("CDS found. Going to create introns"); //TWS DEBUG
                var CDS = array.filter(subfeatures, function (obj) {
                    return obj.type === 'CDS';
                });

                this.sortByKey(CDS, 'start');
                subfeatures = subfeatures.concat(this.intronsFromExons(CDS));

            }
        }

        this.sortByKey(subfeatures, 'start');
        
	    return subfeatures;
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
    },

    /**
     * Title: _getTypes
     * Description: Takes type information from subfeatures array, and
     * returns an array of unique values for 'type'
     * @param {subfeatures (Array)}
     * @returns {types (Array)}
     */
    _getTypes: function (subfeatures) {
        //console.log("Calling getTypes"); //TWS DEBUG
        var types = array.map(subfeatures, function(obj) {
            return obj.type;
        }).sort().filter(function (item, index, self) {
            return self.indexOf(item) === index;
        });

        return types;
    }
            
});
});

function checkForOverlap (subfeatures) {
    //console.log("Calling checkForOverlap"); //TWS DEBUG
    var warnings = '';

    for (i = 0; i < subfeatures.length - 1; i++) {
        if (subfeatures[i].start < subfeatures[i+1].end && subfeatures[i].end > subfeatures[i+1].start) {
            warnings += "Warning: Overlap between features: "+subfeatures[i].id+" and "+subfeatures[i+1].id+"\n";
        }
    }

    if (warnings.length > 0) {
        warnings += "Overlapping subfeatures will cause problems in viewing their boundaries.\nThis may also cause the Feature Sequence Viewer to respond slowly. ";
        alert(warnings);
    }

    return warnings.length > 0 ? warnings : -1 ;
}
