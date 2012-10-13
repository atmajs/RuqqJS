
include.js({
    framework: 'ruqq.base'
}).done(function() {
    var w = window,
        r = ruqq,
        prfx = r.info.cssprefix;

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
        timing: prfx + 'transition-timing-function'
    };
    
    r.animate.Model = Class({        
        Construct: function(model, ondone){
            this.count = 0;
            this.addModel(model);            
        },
        addModel: function(model){            
            if (model instanceof Array){
                for(var i = 0, x, length = model.length; x = model[i], i<length; i++){
                    this.addModel(x);
                }
                return;
            }            
            switch(typeof model){
                case 'string':
                    this._addModel(this._parse(model));
                    break;
                case 'object':
                    if (model != null) this._addModel(model);
                    break;                    
            }            
        },
        start: function(element){
            if (this.startCss){
                for(var key in this.startCss) element.style[key] = this.startCss[key];
            }
            setTimeout(function(){
                for(var key in this.css){
                    element.style[key] = this.css[key];
                }                
            }.bind(this),0)
        },
        /**
         *  '{prop} | {?from} > {to} | {duration}ms | {?timing}'
         */
        _parse: function(model){
            var arr = model.split(/ *\| */g),
                data = {},
                length = arr.length;
            
            data.prop = arr[0];
            
            var vals = arr[1].split(/ *> */);
            data.from = vals.length == 2 ? vals[0] : null;
            data.to = vals[vals.length - 1];
            
            
            data.duration = length >  2 ? arr[2] : '200ms';
            data.timing = length > 3 ? arr[3] : 'linear';
           
            return data;
        },
        /**
         * Apply Raw Object */
        _addModel: function(data){
            this.count++;
            
            if (data.from != null){
                if (this.startCss == null) this.startCss = {};
                this.startCss[data.prop] = data.from;
            }            
            if (this.css == null)  this.css = {};
            
            for(var key in I) this.css[I[key]] = (this.css[I[key]] ? this.css[I[key]] + ',' : '') + data[key];            
            
            ////this.css[I.prop] = (this.css[I.prop] ? this.css[I.prop] + ',' : '') + data.prop;            
            ////this.css[I.duration] = (this.css[I.duration] ? this.css[I.duration] + ',' : '') + data.duration;
            ////this.css[I.timing] = (this.css[I.timing] ? this.css[I.timing] + ',' : '') + data.timing;
            
            this.css[data.prop] = data.to;
        }
    });



    r.animate.sprite = (function() {
        var keyframes = {},
            prfx = r.info.cssprefix,
            vendor = null,
            initVendorStrings = function(){
                var prfx = r.info.prefix;
                vendor = {
                    keyframes: "@" + prfx+ "keyframes",
                    AnimationIterationCount: prfx + 'AnimationIterationCount',
                    AnimationDuration: prfx + 'AnimationDuration',
                    AnimationTimingFunction: prfx + 'AnimationTimingFunction',
                    AnimationFillMode: prfx + 'AnimationFillMode',
                    AnimationName: prfx + 'AnimationFillMode'
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