if (typeof Function.prototype.bind === 'undefined') {
	Function.prototype.bind = function() {
		if (arguments.length < 2 && typeof arguments[0] == "undefined") {
			return this;
		}
		var __method = this,
			args = Array.prototype.slice.call(arguments),
			object = args.shift();
		return function() {
			return __method.apply(object, args.concat(Array.prototype.slice.call(arguments)));
		};
	};
}

if (typeof Object.defineProperty === 'undefined') {
	if (({}).__defineGetter__ !== 'undefined') {
		Object.defineProperty = function(obj, prop, data) {
			if (data.set) {
				obj.__defineSetter__(prop, data.set);
			}
			if (data.get) {
				obj.__defineGetter__(prop, data.get);
			}
		};
	}
}

if (typeof Date.now === 'undefined') {
	Date.now = function() {
		return new Date().getTime();
	};
}

if (typeof window.requestAnimationFrame === 'undefined') {
	window.requestAnimationFrame = (function() {
		var w = window;
		return w.requestAnimationFrame || //
		w.webkitRequestAnimationFrame || //
		w.mozRequestAnimationFrame || //
		w.oRequestAnimationFrame || //
		w.msRequestAnimationFrame || //
		function(callback) {
			return setTimeout(callback, 17);
		};
	}());
}

/** String */
if (typeof String.prototype.trim === 'undefined'){
	String.prototype.trim = function(){
		return this.replace(/(^\s)|(\s$)/g,'');
	}
}
if (typeof Array.prototype.indexOf === 'undefined'){
	Array.prototype.indexOf = function(value){
		for(var i = 0; i< this.length; i++){
			if (value === this[i]){
				return i;
			}
		}
		return -1;
	}
}