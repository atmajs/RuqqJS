(function() {
   "use strict";

   var w = window,
       r = typeof w.ruqq === 'undefined' ? (w.ruqq = {}) : ruqq;

   r.doNothing = function() {
      return false;
   };




   (function(r) {
      var div = document.createElement('div'),
          I = r.info || {};
      r.info = I;

      I.hasTouchSupport = (function() {
         if ('createTouch' in document) {
            return true;
         }
         try {
            return !!document.createEvent("TouchEvent").initTouchEvent;
         } catch (error) {
            return false;
         }
      }());
      I.prefix = (function() {
         if ('transform' in div.style) {
            return '';
         }
         if ('webkitTransform' in div.style) {
            return 'webkit';
         }
         if ('MozTransform' in div.style) {
            return 'Moz';
         }
         if ('OTransform' in div.style) {
            return 'O';
         }
         if ('msTransform' in div.style) {
            return 'ms';
         }
         return '';
      }());
      I.cssprefix = I.prefix ? '-' + I.prefix.toLowerCase() + '-' : '';
      I.supportTransitions = I.prefix + 'TransitionProperty' in div.style;

   }(r));


   return r;

}());
