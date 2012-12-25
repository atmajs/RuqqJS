if (typeof ruqq == 'undefined') ruqq = {};

ruqq.events = (function() {
    var callbacks = {};

    var hasTouch = (function() {
        if ('createTouch' in document)  return true;
        try {
            return !!document.createEvent('TouchEvent').initTouchEvent;            
        } catch (error) {
            return false;
        }        
    })();

    var E = { /** global events handler */
        bind: function(action, callback) {
            (callbacks[action] || (callbacks[action] = [])).push(callback);
            return this;
        },
        once: function(action, callback){
            callback.once = true;
            (callbacks[action] || (callbacks[action] = [])).push(callback);
            return this;
        },
        
        trigger: function() {
            var args = Array.prototype.slice.call(arguments),
                action = args.shift(),
                fns = callbacks[action];
            if (fns != null) {
                for (var i = 0, length = fns.length; i < length; i++) {
                    fn = fns[i];
                    fn.apply(null, args);
                    if (fn.once != null){
                        fns.splice(i,1);
                        i--;
                        length--;
                    }
                }
            }
            return this;
        },
        unbind: function(action, callback) {
            if (action in callbacks) {
                var arr = callbacks[action];

                for (var item, i = 0, length = arr.length; i < arr.length; i++) {
                    item = arr[i];

                    if (item == callback) {
                        callbacks.splice(i, 1);
                    }
                    i--;
                }
            }
            return this;
        },

        touchStart: hasTouch ? 'touchstart' : 'mousedown',
        touchEnd: hasTouch ? 'touchend' : 'mouseup',
        move: hasTouch ? 'touchmove' : 'mousemove',
        click: hasTouch ? 'touchstart' : 'click',
        preventDefault: function() {
            return false;
        }
    } // E

    return E;
})();