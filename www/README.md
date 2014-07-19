## REQUIREMENTS:
<a href="http://jquery.com/">jQuery</a>
## USAGE:
### 1) Default Snippet
```html
  <script type="text/javascript">
    var _rtq = _rtq || [];
    _rtq.push(['set', 'apiKey', 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX']);
    //_rtq.push(['set', 'autoCollect', false]);
    //_rtq.push(['set', 'ograph', true]);
  
    (function() {
      var rca = document.createElement('script'); rca.type = 'text/javascript'; rca.async = true;
      rca.src = 'http://www.recolytic.com/plugin/recolytic.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(rca, s);
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
* trackUpTake  : activate/disable the tracking of click of recommended links  (default true)
* baseUrl      : default //www.api.recolytic.com/
* ograph       : activate/disable open graph protocol support, used to get the id, title and image of the item (default false)


## ACTIONS:
* set(key, value): allows you to set an option
    * key
    * value
<br /><br /><br />
* collect(url, cb): collect a page view on a ressource
    * url (optional: dafault is the current page)
    * cb (optional: callback when collect is done)
<br /><br /><br />
* uptake(rxid, page, strategy, cb): track clicks of recommended ressources
    * rxid: resource or item id
    * page: page type (landing page, product page, catalog, checkout)
    * strategy: the used recommendation strategy can be one of these values (high priority, most popular, item to item, user to user, co-occurence, group, recently visited)
    * cb (optional: callback when uptake is done)

