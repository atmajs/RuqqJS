(function(global) {

    var handler;

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

    var match = function(routes, hash) {
        if (!routes) {
            return;
        }

        for (var i = 0, x, length = routes.length; i < length; i++) {
            x = routes[i];
            var result = x.match.exec(hash);
            if (!result || !result.length) {
                continue;
            }

            x.callback(deserialize(hash.replace(x.match, x.param)), hash);
        }

    };

    var combine = function(_1, _2) {
        if (!_1) return _2;
        if (!_2) return _1;
        if (_2[0] == '/') _2 = _2.substring(1);
        if (_1[_1.length - 1] == '/') return _1 + _2;
        return _1 + '/' + _2;
    };

    var getHash = function(){
        return (global.location.hash || '').replace(/^#\/?/, '/');
    }

    var regexpify = function(value){
        if (value instanceof RegExp){
            return value;
        }
        if (typeof value !== 'string'){
            console.error('Unsupported type', value);
            value = '';
        }

        value = value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        return new RegExp('^' + value, 'i');
    }


    function HashHandler(root) {
        this.root = root;
        this.rootRegexp = regexpify(root);
        this.routes = [];
    }

    HashHandler.prototype = {
        constructor: HashHandler,
        hashchanged: function(hash) {
            if (hash == null){
                hash = getHash();

                /*  root handler calls childrens hashchanged alwas with
                 *  cutted hash */
                if (this.root !== '/'){
                    if (this.rootRegexp.test(hash) === false){
                        return;
                    }
                    hash = hash.replace(this.rootRegexp, '');
                }
            }

            match(this.routes, hash);
        },
         /**
         *      route = {Object} =
         *      {
         *              match: {regexp},
         *              param: {querystring} // 'key=$1&key2=$2'
         *      }
         *
         *      route = {String} = '/:key/value'
         */
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
                x = null,
                i = 0;
            for (; i < length; i++) {
                x = isarray ? routes[i] : routes;

                if (typeof x.match === 'string') {
                    parse(x);
                }

                this.routes.push(x);
            }
        },

        clear: function(){
            this.routes = [];
        },

        navigate: function(hash) {
            global.location.hash = !hash ? '' : combine(this.root, hash);
        },
        current: function() {
            var x;
            return (x = match(this.routes, getHash())) && deserialize(x.hash.replace(x.match, x.param));
        },

        createHandler: function(path){

            path = path.replace(/(^[\/]+)|([\/]+$)/g, '');

            var root = combine(this.root, path),
                handler = new HashHandler(root);

            this.add(path, function(hash, raw){
                handler.hashchanged(raw.replace(root, ''));
            });

            return handler;
        }
    };



    global.routes = handler = new HashHandler('/');



    global.onhashchange = function(){
        handler.hashchanged(getHash());
    };

}(window));
