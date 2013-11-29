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

  var actions = {
    set:function(key, value){
      this.options = this.options || {};
      this.options[key] = value;
      return true;
    }
  , collect:function(url, cb){
      if(!this.options.apiKey) return false;
      if(isFunction(url)){
        cb = url;
        url = undef;
      }
      $.ajax({
        url:this.options.baseUrl+'collect/'+this.options.apiKey
      , dataType:'jsonp'
      , data:{ 'rxid': url || location.href }
      }).always(cb || function(){});
      return true;
    }
  , uptake:function(url, context, cb){
      if(!this.options['apiKey']) return false;
      if(isFunction(context)){
        cb = context;
        context = undef;
      }
      /*
       * CX ID = context id (url of the page where recomendation is from)
       * RX ID = resource id (url of the rcommended page clicked by the user)
       */
      $.ajax({
        url:this.options.baseUrl+'measure/uptake/'+this.options.apiKey
      , dataType:'jsonp'
      , data:{
          'rxid':url
        , 'cxid':context || location.href
        }
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
      self.push(['uptake', url, function(){
        location.href = url;
      }]);
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

  new Recolytic();

})();
