/*
 **************************
 *                        *
 *   Recolytics Plugin    *
 *                        *
 *   by Benjamin Chelli   *
 *   the 2013-11-29       *
 *                        *
 **************************
 */
;(function(undef){

  /*
   * Helpers
   */
  function isArray(a){
    return Object.prototype.toString.apply(a) === '[object Array]';
  }

  function isFunction(f){
    return Object.prototype.toString.apply(f) === '[object Function]';
  }

  function tryGetOpenGraphAttribute(name){
    var elem = $("meta[name='og\\:"+ name+ "']");
    if(elem && elem.attr('content')) return elem.attr('content');
    else return false;
  }

  function apiCollectCall(cb, params){
    $.ajax({
      url:this.options.baseUrl+'collect/'+this.options.apiKey
      , dataType:'jsonp'
      , data: params
      }).always(cb || function(){});
  }

  function getQueryStringParameterByName(pageUrl, name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(pageUrl);
      return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }  

  //available actions 
  var actions = {
    set:function(key, value){
      this.options = this.options || {};
      this.options[key] = value;
      return true;
    }
  , collect:function(rxid, cb){ // resource id, call back
      if(!this.options.apiKey) return false;
      if(isFunction(rxid)){
        cb = rxid;
        rxid = undef;
      }
      //if open graph option is active 
      if(this.options.ograph){
        var id = tryGetOpenGraphAttribute('url')
          , title = tryGetOpenGraphAttribute('title')
          , image = tryGetOpenGraphAttribute('image');

        if(id) {
          var params = {};
          params['rxid'] = id; 
          if(title) params['t'] = title;
          if(image) params['m'] = image;
          apiCollectCall(params, cb);
        } else {
          apiCollectCall({ 'rxid': rxid || location.href }, cb);  
        }
      } else {
        apiCollectCall({ 'rxid': rxid || location.href }, cb);
      }
      return true;
    }
  , uptake:function(rxid, page, strategy, cb){ 
      //rxid: the id of resource that user clicked on
      //page: page in which the recommendation was submitted
      //strategy: the used recommendation strategy
      if(!this.options['apiKey'] || !rxid ) return false;
      if(isFunction(page)){
        cb = page;
        page = undef;
      }
      if(isFunction(strategy)){
        cb = strategy;
        strategy = undef;
      }

      var params = {};
      params['rxid'] = rxid;
      params['location'] = page || 'not filled'; 
      params['strategy'] = strategy || 'not filled';

      $.ajax({
        url:this.options.baseUrl+'measure/uptake/'+this.options.apiKey
      , dataType:'jsonp'
      , data: params
      }).always(cb || function(){});
      return true;
    }
  }

  /*
   * Recolytic OBJECT
   */
  var Recolytic = function(){
    this.initDefaultOptions();
    this.initTrackingQueue();
    this.initUpTake();
    this.initAutoCollect();
  }

  /*
   * Recolytic init functions
   */
  Recolytic.prototype.initDefaultOptions = function(){

    // init options
    this.options = this.options || {};

    // init default
    this.options.apiKey       = this.options.apiKey       || false;
    this.options.autoCollect  = this.options.autoCollect  || true;
    this.options.trackUpTake  = this.options.trackUpTake  || true;
    this.options.baseUrl      = this.options.baseUrl      || '//www.recolytic.com/api/engine/';

  }

  Recolytic.prototype.initUpTake = function(){

    var self = this;

    if(!self.options.trackUpTake) return;

    $('body').on('click', 'a[href$=recolytic-uptake]', function(ev){
      ev.preventDefault();
      var $el = $(ev.currentTarget)
        , url = $el.attr('href').replace(/[?&]recolytic-uptake$/, '')
        ;

      var rxid = getQueryStringParameterByName(url, "recolytic-id") ;
         
      if(rxid){
        var strategy = getQueryStringParameterByName(url, "recolytic-s")
          , page = getQueryStringParameterByName(url, "recolytic-l"); // page category

        self.push(['uptake', rxid, page, strategy, function(){
          location.href = url;
        }]);    
      } else {
        self.push(['uptake', url, null, null, function(){
          location.href = url;
        }]);
      }
    });
  }

  Recolytic.prototype.initAutoCollect = function(){

    if(!this.options.autoCollect) return;

    this.push(['collect', location.href]);

  }

  Recolytic.prototype.initTrackingQueue = function(){
    this._rtq = [];
    this.push.apply(this, window._rtq || []);
    window._rtq = this;
  }


  /*
   * Recolytic push function
   */
  Recolytic.prototype.push = function(){

    // add to local queue
    this._rtq.push.apply(this._rtq, arguments);

    // process local queue
    var trackings = this._rtq.slice(0); // copy array
    this._rtq = [];
    for ( var i = 0, l = trackings.length; i < l; i++ ) {
      // action needs to exist
      if( isArray(trackings[i]) && trackings[i].length > 0 && actions[trackings[i][0]] ) {
        // execute action: return false => do it later
        var result = actions[trackings[i][0]].apply(this, trackings[i].slice(1));
        if( !result ){
          this._rtq.push(trackings[i]);
        }
      }
    }
  }

  /*
  * RECOMMENDATION CALLS
  * please 
  */

  function recommendApiCallHelper(url, params, callback) {
    $.ajax({
      url: url
      , jsonp: "callback"
      , dataType:'jsonp'
      , data: params
    }).done(callback).fail(function() {
      callback([]);
    });   
  } 

  Recolytic.prototype.recommendMostPopular = function(pageType, scopes, limit, skip, callback){
    // /recommend/np/topn/{apikey}?sc={scope1}&sc={scope2}&l={limit}&sk={skip}&location={location}
    var params = {};
    params['location'] = pageType || 'not filled';
    if(limit) params['l'] = limit;
    if(skip) params['sk'] = skip;
    recommendApiCallHelper(this.options.baseUrl+'recommend/np/topn/'+this.options.apiKey
                          , params
                          , callback);
  }

  Recolytic.prototype.recommendhighPriority = function(pageType, scopes, limit, skip, weightThreshold, callback){
    ///api/engine/recommend/np/priorityrx/{apikey}?sc={scope1}&rxwt={weightTHR}&l={limit}&sk={skip}&location={location} High priority resources
    var params = {};
    params['location'] = pageType || 'not filled';
    if(limit) params['l'] = limit;
    if(skip) params['sk'] = skip;
    if(weightThreshold) params['rxwt'] = weightThreshold;

    recommendApiCallHelper(this.options.baseUrl+'recommend/np/priorityrx/'+this.options.apiKey
                          , params
                          , callback);       
  }

  Recolytic.prototype.recommendItemToItem = function(pageType, resourceId, isScoped, limit, skip, callback){
    // /api/engine/recommend/cf/ii/{apikey}?rxid={resourceId}&sc={isScoped}&l={limit}&sk={skip}&location={location}
    if(!resourceId) callback([]); 
    else{
      var params = {};
      params['rxid'] = resourceId;
      params['location'] = pageType || 'not filled';
      if(limit) params['l'] = limit;
      if(skip) params['sk'] = skip;
      if(isScoped) params['sc'] = isScoped;

      recommendApiCallHelper(this.options.baseUrl+'recommend/cf/ii/'+this.options.apiKey
                          , params
                          , callback);   
    }     
  }

  Recolytic.prototype.recommendCoOccurence = function(pageType, resources, actionThreshold, limit, skip, callback){
    //GET /api/engine/recommend/cf/basket/{apikey}?rx={rxid1}&rx={rxid2}&at={actionTHR}&l={limit}&sk={skip}&location={location} Co-Occurence
    if(!resources) callback([]); 
    else{
      var params = {};
      params['rx'] = resources;
      params['location'] = pageType || 'not filled';
      if(limit) params['l'] = limit;
      if(skip) params['sk'] = skip;      
      if(actionThreshold) params['at'] = actionThreshold;

      recommendApiCallHelper(this.options.baseUrl+'recommend/cf/basket/'+this.options.apiKey
                          , params
                          , callback);               
    }
  }

  Recolytic.prototype.recommendPersonalizedCoOccurence = function(pageType, resources, actionThreshold, limit, skip, callback){
    // /api/engine/recommend/pcf/basket/{apikey}?rx={rxid1}&rx={rxid2}&at={actionTHR}&l={limit}&sk={skip}&location={location} Personalized Co-Occurence
    if(!resources) callback([]); 
    else{
      var params = {};
      params['rx'] = resources;
      params['location'] = pageType || 'not filled';
      if(limit) params['l'] = limit;
      if(skip) params['sk'] = skip;      
      if(actionThreshold) params['at'] = actionThreshold;

      recommendApiCallHelper(this.options.baseUrl+'recommend/pcf/basket/'+this.options.apiKey
                          , params
                          , callback);               
    }    
  }  

  Recolytic.prototype.recommendUserToUser = function(pageType, scopes, memberid, limit, skip, callback){
    // /api/engine/recommend/pcf/uu/{apikey}?sc={scope}&mid={memberId}&l={limit}&sk={skip}&location={location} User to user collaborative filtering
    var params = {};
    params['location'] = pageType || 'not filled';
    if(limit) params['l'] = limit;
    if(skip) params['sk'] = skip;      
    if(scopes) params['sc'] = scopes;   
    if(memberid) params['mid'] = memberid;    


    recommendApiCallHelper(this.options.baseUrl+'recommend/pcf/uu/'+this.options.apiKey
                          , params
                          , callback);         
  }  

  Recolytic.prototype.recommendToGroup = function(pageType, members, limit, skip, callback){
    ///api/engine/recommend/pcf/group/{apikey}&m={mid1}&m={mid2}&l={limit}&sk={skip}&location={location} Group recommender
    if(!members) callback([]); 
    else{
      var params = {};
      params['m'] = members;
      params['location'] = pageType || 'not filled';
      if(limit) params['l'] = limit;
      if(skip) params['sk'] = skip;      
      recommendApiCallHelper(this.options.baseUrl+'recommend/pcf/group/'+this.options.apiKey
                            , params
                            , callback); 
    }
  }   

  Recolytic.prototype.recommendRecenltyVisited = function(pageType, memberId, actionWeight,limit, skip, callback ){
    var params = {};
    params['location'] = pageType || 'not filled';  
    if(limit) params['l'] = limit;
    if(skip) params['sk'] = skip;  
    if(memberId) params['mid'] = memberId;  
    if(actionWeight) params['aw'] = actionWeight;   

     ///api/engine/recommend/p/recenltyVisited/{apikey}?mid={memberId}&aw={maw}&l={limit}&sk={skip}&location={location} Returns recently visited resources
    recommendApiCallHelper(this.options.baseUrl+'recommend/p/recenltyVisited/'+this.options.apiKey
                          , params
                          , callback); 
  }   

  // init the recolytic object
  new Recolytic();

})();
