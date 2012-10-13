if (typeof Function.prototype.bind === 'undefined') {
    Function.prototype.bind = function() {
        if (arguments.length < 2 && typeof arguments[0] == "undefined") return this;
        var __method = this,
            args = Array.prototype.slice.call(arguments),
            object = args.shift();
        return function() {
            return __method.apply(object, args.concat(Array.prototype.slice.call(arguments)));
        }
    }
}


if (typeof Date.now === 'undefined') {
    Date.now = function() {
        return new Date().getTime();
    }
}

window.requestAnimationFrame = (function() {
	var w = window;
	return w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.mozRequestAnimationFrame || w.oRequestAnimationFrame || w.msRequestAnimationFrame ||
	function(callback) {
		return setTimeout(callback, 17);
	}
})();