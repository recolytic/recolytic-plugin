## REQUIREMENTS:
### jQuery

## USAGE:
### 1) Default Snippet
```html
  <script type="text/javascript">

    var _rtq = _rtq || [];
    _rtq.push(['set', 'apiKey', 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX']);
    // _rtq.push(['set', 'autoCollect', false]);

    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = '//www.recolytic.com/track.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

  </script>
```

### 2) Call a recolytic action
```html
  <script type="text/javascript">

    var _rtq = _rtq || [];
    _rtq.push(['action_name', 'argument_1', 'argument_2', ..., 'argument_n']);

  </script>
```

## OPTIONS:
* apiKey       : your recolytic API key (required to used recolytic API)
* autoCollect  : activate/deactivate the collecting of page/ressource view (default true)
* trackUpTake  : activate/deactivate the tracking of click of recommended links  (default true)
* baseUrl      : default //www.recolytic.com/api/engine/

## ACTIONS:
* set(key, value): allows you to set an option
    * key
    * value
<br /><br /><br />
* collect(url, cb): collect a page view on a ressource
    * url (optional: dafault is the current page)
    * cb (optional: callback when collect is done)
<br /><br /><br />
* uptake(url, context, cb): track clicks of recommended ressources
    * url
    * context (optional: dafault is the current page)
    * cb (optional: callback when uptake is done)

