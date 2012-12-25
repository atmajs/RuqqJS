(function() {

	if (typeof navigator == 'undefined') {
		return;
	}

	var w = window,
		r = typeof w.ruqq === 'undefined' ? (w.ruqq = {}) : ruqq,
		info = r.info || (r.info = {}),
		ua = navigator.userAgent,
		_object, _prop1, _prop2;

	function use(container, prop1, prop2) {
		_object = container;
		_prop1 = prop1;
		_prop2 = prop2;
	}

	function has(str, value, regexp) {
		if (ua.indexOf(str) == -1) {
			return false;
		}
		_object[_prop1] = value;

		if (regexp && _prop2) {
			var match = regexp.exec(ua);
			if (match && match.length > 1) {
				_object[_prop2] = match[1];
			}
		}
		return true;
	}


	use(info.platform = {}, 'name');
	if (!( //
	has('Windows', 'win') || //
	has('Mac', 'mac') || //
	has('Linux', 'linux') || //
	has('iPhone', 'iphone') || //
	has('Android', 'android'))) {
		info.platform.name = 'unknown'
	}

	use(info.browser = {}, 'name', 'version')
	if (!( //
	has('MSIE', 'msie', /MSIE (\d+(\.\d+)*)/) || //
	has('Firefox', 'firefox', /Firefox\/(\d+(\.\d+)*)/) || //
	has('Safari', 'safari', /Version\/(\d+(\.\d+)*)/) || //
	has('Opera', 'opera', /Version\/? ?(\d+(\.\d+)*)/))) {
		info.browser.name = 'unknown';
		info.browser.version = 0;
	}
	has('Chrome', 'chrome', /Chrome\/(\d+(\.\d+)*)/);


	use(info.engine = {}, 'name', 'version');
	if (!( //
	has('Trident', 'trident', /Trident\/(\d+(\.\d+)*)/) || //
	has('Gecko', 'gecko', /rv:(\d+(\.\d+)*)/) || //
	has('Presto', 'presto', /Presto\/(\d+(\.\d+)*)/) || //
	has('Opera', 'opera', /Version\/? ?(\d+(\.\d+)*)/))) {
		info.engine.name = 'unknown';
		info.engine.version = 0;
	}
	has('WebKit', 'webkit', /WebKit\/(\d+(\.\d+)*)/);

}());