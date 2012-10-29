include.js('last.js').done(function() {
  $.fn.invoker = function() {
	var args = Array.prototype.slice.call(arguments),
		object = this,
		__method = args.shift();
	return function() {
	  return object[__method].apply(object, args);
	}
  }

  $.fn.cssAnimation = function(property, valueTo, duration, callback, valueFrom, timing) {
	ruqq.animate(this, property, valueTo, duration, callback, valueFrom, timing);
	return this;
  }

});