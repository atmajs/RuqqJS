include.js({
    framework: 'ruqq.base'
}).done(function() {
    var w = window,
        r = ruqq,
        prfx = r.info.cssprefix,
        getTransitionEndEvent = function() {
            var el = document.createElement('fakeelement'),
                transitions = {
                    'transition': 'transitionend',
                    'OTransition': 'oTransitionEnd',
                    'MSTransition': 'msTransitionEnd',
                    'MozTransition': 'transitionend',
                    'WebkitTransition': 'webkitTransitionEnd'
                },
                event = null;

            for (var t in transitions) {
                if (el.style[t] !== undefined) {
                    event = transitions[t];
                    break;
                }
            }

            getTransitionEndEvent = function() {
                return event;
            }
            el = null;
            transitions = null;
            return getTransitionEndEvent();

        };

    r.animate = (function() {
        function Animate(element, property, valueTo, duration, callback, valueFrom, timing) {


            var data = typeof property === 'string' ? {
                property: property,
                valueFrom: valueFrom,
                valueTo: valueTo,
                duration: duration,
                timing: timing,
                callback: callback
            } : property,
                $this = $(element);

            if (data.timing == null) data.timing = 'linear';
            if (data.duration == null) data.duration = 300;


            if (data.valueFrom != null) {
                var css = {};
                css[data.property] = data.valueFrom;
                css[prfx + 'transition-property'] = 'none';
                css[prfx + 'transition-duration'] = '0ms';

                $this.css(css);
            }
            setTimeout(function() {
                var css = {};
                css[data.property] = data.valueTo;
                css[prfx + 'transition-property'] = data.property;
                css[prfx + 'transition-duration'] = data.duration + 'ms';
                css[prfx + 'transition-timing-function'] = data.timing;

                $this.css(css);

                if (data.callback) {
                    var timeout = setTimeout(data.callback.bind($this), data.duration);
                    $this.data('cssAnimationCallback', timeout);
                }

                element = null;
                data = null;
            }, 0);

            return this;
        }

        function AnimateModel(model, ondone) {
            var isarray = model instanceof Array,
                length = isarray ? model.length : 1,
                x = null;

            var beforeCss = null;
            for (var i = 0; x = isarray ? model[i] : model, isarray ? i < length : i < 1; i++) {
                if (x.from == null) continue;
                (beforeCss || (beforeCss = {}))[x.prop] = x.from;
            }


            for (var i = 0; x = isarray ? model[i] : model, isarray ? i < length : i < 1; i++) {
                var callback = x.onComplete ? scopeModel(x.onComplete) : ondone;
                Animate(x.element, x.prop, x.to, x.duration, callback, x.from, x.timing);
            }
        }

        function scopeModel(model, callback) {
            return function() {
                AnimateModel(model, callback);
            }
        }

        return function(argument, property, valueTo, duration, callback, valueFrom, timing) {
            if (argument instanceof HTMLElement) {
                Animate(argument, property, valueTo, duration, callback, valueFrom, timing);
                return this;
            }
            AnimateModel(argument, property);
            return this;
        }
    })();



    var I = {
        prop: prfx + 'transition-property',
        duration: prfx + 'transition-duration',
        timing: prfx + 'transition-timing-function',
        delay: prfx + 'transition-delay'
    };

    console.log('prfx', prfx);
    //prfx = '';

    r.animate.ModelData = (function() {

        var vendorProperties = {
            'transform': null
        };

        function parse(model) {
            var arr = model.split(/ *\| */g),
                data = {},
                length = arr.length;

            data.prop = arr[0] in vendorProperties ? prfx + arr[0] : arr[0];


            var vals = arr[1].split(/ *> */);

            if (vals[0]) data.from = vals[0];

            data.to = vals[vals.length - 1];

            if (length > 2) {
                var info = /(\d+m?s)?\s*([a-z]+[^\s]*)?\s*(\d+m?s)?/.exec(arr[2]);
                if (info != null) {
                    data.duration = info[1] || '200ms';
                    data.timing = info[2] || 'linear';
                    data.delay = info[3] || '0';
                    return data;
                }
            }
            data.duration = '200ms';
            data.timing = 'linear';
            data.delay = '0';
            return data;
        }

        var TransformModel = (function() {
            var regexp = /([\w]+)\([^\)]+\)/g;

            function extract(str) {
                var props = null;
                regexp.lastIndex = 0;
                while (1) {
                    var match = regexp.exec(str);
                    if (!match) {
                        return props;
                    };
                    (props || (props = {}))[match[1]] = match[0];
                }
            };

            function stringify(props) {
                var keys = Object.keys(props).sort().reverse();
                for (var i = 0; i < keys.length; i++) {
                    keys[i] = props[keys[i]];
                }
                return keys.join(' ');
            };

            return Class({
                Construct: function() {
                    this.transforms = {};
                },
                handle: function(data) {
                    var start = extract(data.from),
                        end = extract(data.to);

                    if (start) {
                        for (var prop in this.transforms) {
                            if (prop in start === false) {
                                console.log('from', prop, this.transforms[prop]);
                                start[prop] = this.transforms[prop];
                            }
                        }
                        data.from = stringify(start);

                        for (var prop in start) {
                            this.transforms[prop] = start[prop];
                        }
                    }

                    for (var prop in this.transforms) {
                        if (prop in end === false) end[prop] = this.transforms[prop];
                    }
                    data.to = stringify(end);

                    for (var prop in end) {
                        this.transforms[prop] = end[prop];
                    }



                }
            })
        })();

        var ModelData3 = Class({
            Construct: function(data, parent) {
                this.parent = parent;
                this.transformModel = parent && parent.transformModel || new TransformModel();

                var model = data.model || data;

                if (model instanceof Array) {
                    this.model = [];
                    for (var i = 0, x, length = model.length; x = model[i], i < length; i++) {
                        this.model.push(new ModelData3(x, this));
                    }
                } else if (model instanceof Object) {
                    this.model = [new ModelData3(model, this)];
                } else if (typeof model === 'string') {
                    this.model = parse(model);

                    if (~this.model.prop.indexOf('transform')) {
                        this.transformModel.handle(this.model);
                    }
                }

                if (data.next != null) {
                    this.next = new ModelData3(data.next, this);
                }

                if (parent == null) {
                    this.reset();
                    //this.handleTransform();
                }
            },
            //////////handleTransform: function(){                                
            //////////},
            reset: function() {
                this.state = 0;
                this.modelCount = this.model instanceof Array ? this.model.length : 1;
                this.nextCount = 0;
                if (this.next != null) this.nextCount = this.next instanceof Array ? this.next.length : 1;

                var isarray = this.model instanceof Array,
                    length = isarray ? this.model.length : 1,
                    x = null;
                for (var i = 0; x = isarray ? this.model[i] : this.model, isarray ? i < length : i < 1; i++) {
                    x.reset && x.reset();
                }
            },
            getNext: function() {
                if (this.state == 0) {
                    this.state = 1;
                    return this;
                }

                if (this.state == 1 && this.modelCount > 0) {
                    --this.modelCount;
                }
                if (this.state == 1 && this.modelCount == 0) {
                    this.state = 2;
                    if (this.next) return this.next;
                }
                if (this.state == 2 && this.nextCount > 0) {
                    --this.nextCount;
                }

                if (this.state == 2 && this.nextCount == 0 && this.parent) {
                    return this.parent.getNext && this.parent.getNext();
                }
                return null;
            }
        });

        return ModelData3;
    })();



    var Stack = Class({
        Construct: function() {
            this.arr = [];
        },
        put: function(modelData3) {
            if (modelData3 == null) return false;

            var next = modelData3.getNext();

            if (next == null) {
                return false;
            }
            if (next instanceof Array) {
                var r = false;
                for (var i = 0, x, length = next.length; x = next[i], i < length; i++) {
                    if (this.put(x) == true) r = true;
                }
                return r;
            }

            if (next.model instanceof Array) {
                var r = false;
                for (var i = 0, x, length = next.model.length; x = next.model[i], i < length; i++) {
                    if (this.put(x) == true) r = true;
                }
                return r;
            }
            if (next.state == 0) next.state = 1;
            this.arr.push(next);
            return true;
        },
        resolve: function(prop) {
            console.log('resolve', prop, this.arr);
            for (var i = 0, x, length = this.arr.length; x = this.arr[i], i < length; i++) {
                if (x.model.prop == prop) {
                    this.arr.splice(i, 1);
                    return this.put(x);
                }
            }
            return false;
        },
        getCss: function(startCss, css) {

            for (var i = 0, x, length = this.arr.length; x = this.arr[i], i < length; i++) {
                if ('from' in x.model) {
                    startCss[x.model.prop] = x.model.from;
                }
                css[x.model.prop] = x.model.to;

                for (var key in I) {
                    (css[I[key]] || (css[I[key]] = [])).push(x.model[key]);
                }
            }
            for (var key in I) {
                css[I[key]] = css[I[key]].join(',')
            }
        },
        clear: function() {
            this.arr = [];
        }
    });

    r.animate.Model3 = Class({
        Construct: function(models) {
            this.stack = new Stack();
            this.model = new r.animate.ModelData(models);
            this.transitionEnd = this.transitionEnd.bind(this);
        },
        getNext: function() {
            //-console.log('getNext');
        },
        start: function(element, onComplete) {
            this.onComplete = onComplete;
            var startCss = {},
                css = {};

            this.model.reset();
            this.stack.clear();
            this.stack.put(this.model);
            this.stack.getCss(startCss, css);



            element.addEventListener(getTransitionEndEvent(), this.transitionEnd, false);
            this.element = element;
            this.apply(startCss, css);
        },
        transitionEnd: function(event) {
            //console.log('transitionEND', event.propertyName, event);
            if (this.stack.resolve(event.propertyName) == true) {
                var startCss = {},
                    css = {};
                this.stack.getCss(startCss, css);
                this.apply(startCss, css);
            } else {
                console.log('END');
                if (this.stack.arr.length < 1) {
                    this.element.removeEventListener(getTransitionEndEvent(), this.transitionEnd, false);
                    this.onComplete && this.onComplete();
                }
            }
        },

        apply: function(startCss, css) {
            console.log('apply', startCss, css);
            startCss[prfx + 'transition'] = 'none';

            var style = this.element.style;
            if (startCss != null) {
                for (var key in startCss) {
                    style.setProperty(key, startCss[key], '');
                    //style[key] = startCss[key];
                }
            }

            setTimeout(function() {
                for (var key in css)
                //style[key] = css[key];
                style.setProperty(key, css[key], '');
            }, 0);
        }
    });



    r.animate.Model = Class({
        Construct: function(model, ondone) {
            this.count = 0;
            this.addModel(model);
        },
        addModel: function(model) {
            if (model instanceof Array) {
                for (var i = 0, x, length = model.length; x = model[i], i < length; i++) {
                    this.addModel(x);
                }
                return this;
            }
            switch (typeof model) {
            case 'string':
                this._addModel(this._parse(model));
                break;
            case 'object':
                if (model != null) this._addModel(model);
                break;
            }
            return this;
        },
        start: function(element, onComplete) {

            if (this.startCss) {
                for (var key in this.startCss) element.style[key] = this.startCss[key];
            }
            setTimeout(function() {
                for (var key in this.css) {
                    element.style[key] = this.css[key];
                }


                var count = this.count,
                    fn = function(e) {
                        //console.log('onCompl', count, e);
                        if (--count == 0) {
                            onComplete && onComplete();
                            element.removeEventListener(getTransitionEndEvent(), fn);
                        }



                    };
                element.addEventListener(getTransitionEndEvent(), fn, false);

            }.bind(this), 0)
        },
        /**
         *  '{prop} | {?from} > {to} | {duration}ms | {?timing}'
         */
        _parse: function(model) {
            var arr = model.split(/ *\| */g),
                data = {},
                length = arr.length;

            data.prop = arr[0];

            var vals = arr[1].split(/ *> */);
            data.from = vals.length == 2 ? vals[0] : null;
            data.to = vals[vals.length - 1];

            if (length > 2) {
                var info = /(\d+m?s)?\s*([a-z]+[^\s]*)?\s*(\d+m?s)?/.exec(arr[2]);
                if (info != null) {
                    data.duration = info[1] || '200ms';
                    data.timing = info[2] || 'linear';
                    data.delay = info[3] || '0';
                    return data;
                }
            }
            data.duration = '200ms';
            data.timing = 'linear';
            data.delay = '0';
            return data;
        },
        /**
         * Apply Raw Object */
        _addModel: function(data) {
            this.count++;

            if (data.from != null) {
                if (this.startCss == null) this.startCss = {};
                this.startCss[data.prop] = data.from;
            }
            if (this.css == null) this.css = {};

            for (var key in I) this.css[I[key]] = (this.css[I[key]] ? this.css[I[key]] + ',' : '') + data[key];

            this.css[data.prop] = data.to;
        }
    });



    r.animate.sprite = (function() {
        var keyframes = {},
            prfx = r.info.cssprefix,
            vendor = null,
            initVendorStrings = function() {
                var prfx = r.info.prefix;
                vendor = {
                    keyframes: "@" + prfx + "keyframes",
                    AnimationIterationCount: prfx + 'AnimationIterationCount',
                    AnimationDuration: prfx + 'AnimationDuration',
                    AnimationTimingFunction: prfx + 'AnimationTimingFunction',
                    AnimationFillMode: prfx + 'AnimationFillMode',
                    AnimationName: prfx + 'AnimationName'
                }
            }
            return {
                /**
                 * {id, frameWidth, frames, frameStart?, property?}
                 */
                create: function(data) {
                    if (vendor == null) {
                        initVendorStrings();
                    }
                    if (keyframes[data.id] == null) {

                        var pos = document.styleSheets[0].insertRule(vendor.keyframes + " " + data.id + " {}", 0),
                            keyFrameAnimation = document.styleSheets[0].cssRules[pos],
                            frames = data.frames - (data.frameStart || 0),
                            step = 100 / frames | 0,
                            property = data.property || 'background-position-x';

                        for (var i = 0; i < frames; i++) {
                            var rule = (step * (i + 1)) + '% { ' + property + ': ' + (-data.frameWidth * (i + (data.frameStart || 0))) + 'px}';
                            keyFrameAnimation.insertRule(rule);
                        }
                        keyFrameAnimation.iterationCount = data.iterationCount;
                        keyFrameAnimation.frameToStop = data.frameToStop;

                        keyframes[data.id] = keyFrameAnimation;
                    }
                },
                start: function($element, animationId, msperframe) {
                    var style = $element.get(0).style;

                    style[vendor.AnimationName] = 'none';
                    setTimeout(function() {
                        var keyframe = keyframes[animationId];

                        if (style[vendor.AnimationFillMode] == 'forwards') {
                            spriteAnimation.stop($element);
                            return;
                        }
                        $element.on(vendor + 'AnimationEnd', function() {
                            var css;
                            if (keyframe.frameToStop) {
                                //TODO: now only last cssRule is taken
                                var styles = keyframe.cssRules[keyframe.cssRules.length - 1].style;
                                css = {};
                                for (var i = 0; i < styles.length; i++) {
                                    css[styles[i]] = styles[styles[i]];
                                }
                            }
                            spriteAnimation.stop($element, css);
                        });

                        style[vendor.AnimationIterationCount] = keyframe.iterationCount || 1;
                        style[vendor.AnimationDuration] = (keyframe.cssRules.length * msperframe) + 'ms';
                        style[vendor.AnimationTimingFunction] = 'step-start';
                        style[vendor.AnimationFillMode] = keyframe.frameToStop ? 'forwards' : 'none';
                        style[vendor.AnimationName] = animationId;

                    }, 0);
                },
                stop: function($element, css) {
                    var style = $element.get(0).style;
                    style[vendor.AnimationFillMode] = 'none';
                    style[vendor.AnimationName] = '';
                    if (css != null) $element.css(css);
                }
            }
    })();

});