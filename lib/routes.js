(function(w) {
    
    /** convert line parameters to object. : 'e=10' to {e:10} */
    var deserialize = function(line) {
        var o = {};
        if (!line) {
            return o;
        }
        for (var item, i, parts = line.split('&');
        (item = parts[(i = -~i) - 1]) && (item = item.split('=')) && (item.length == 2);) {
            o[item[0]] = item[1];
        }
        return o;
    };

    /** parse route.match(string '/:route1/:route2') into route object */
    var parse = (function() {
        function regexpify(line) {
            return line.replace(/([\\\[\]\(\)])/g, '\\$1');
        }


        var part = {
            ':': '(/([\\w]+))',
            '?': '(/([\\w]+))?'
        };

        return function(route) {
            var parts = route.match.split('/'),
                param = '',
                regexpIndex = 2;

            for (var i = 0, x, length = parts.length; i < length; i++) {
                x = parts[i];
                if (!x) {
                    parts.splice(i, 1);
                    i--;
                    length--;
                    continue;
                }

                var c = x[0];
                switch (c) {
                case ':':
                case '?':
                    parts[i] = part[c];
                    param += (param ? '&' : '') + x.substring(c == ':' ? 1 : 2) + '=$' + regexpIndex;
                    regexpIndex += 2;
                    continue;
                }
                parts[i] = '/' + regexpify(x);
            }

            route.match = new RegExp('^' + parts.join(''));
            route.param = param;
            return route;
        };
    }());

    var match = function(routes) {
        if (!routes) {
            return null;
        }

        var hash = (w.location.hash || '').replace(/^#\/?/, '/');
        for (var i = 0, x, length = routes.length; i < length; i++) {
            x = routes[i];
            var result = x.match.exec(hash);
            if (!result || !result.length) {
                continue;
            }

            x.hash = hash;
            return x;
        }
        return null;
    };
    
    /**
     *      route = {Object} = 
     *      {
     *              match: {regexp},
     *              param: {querystring} // 'key=$1&key2=$2'
     *      }
     *
     *      route = {String} = '/:key/value'
     */
    w.routes = new new Class({
        Construct: function() {
            window.onhashchange = this.hashchanged.bind(this);
        },
        hashchanged: function() {
            var x;
            (x = match(this.routes)) && x.callback(deserialize(x.hash.replace(x.match, x.param)));
        },
        add: function(routes) {
            if (routes == null) {
                return;
            }
            if (typeof routes === 'string') {
                this.add({
                    match: routes,
                    callback: arguments[1]
                });
                return;
            }

            var isarray = routes instanceof Array,
                length = isarray ? routes.length : 1,
                x = null;
            for (var i = 0; isarray ? i < length : i < 1; i++) {
                x = isarray ? routes[i] : routes;
                
                if (typeof x.match === 'string') {
                    parse(x);
                }
                (this.routes || (this.routes = [])).push(x);
            }


        },
        navigate: function(hash) {
            w.location.hash = !hash ? '' : ((hash[0] == '/' ? '' : '/') + hash);
        },
        current: function() {
            var x;
            return (x = match(this.routes)) && deserialize(x.hash.replace(x.match, x.param));
        }
    });




}(window));