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
  // init the recolytic object
  new Recolytic();

  //recommendation object 
  return actions;


})();
