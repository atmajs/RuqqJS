include.js({
	lib: 'compo',
	framework: ['dom/zepto', 'animation']
}).ready(function() {

	//new Compo('#layout').render().insert(document.body);


	var $div = $('#panel');

	window.onerror = function() {
		console.log(arguments);
	}

	//new ruqq.animate.Model3(['-webkit-transform | translate(0px, -200px) > translate(0px, 0px) | 200ms',
     //'-webkit-transform | > translate(200px, 0px) | 200ms 5s']).start($div[0]);

	new ruqq.animate.Model3([ //
            '-webkit-transform | translate(0px, -200px) > translate(0px, 0px) | 100ms', //
            '-webkit-transform | > translate(200px, 0px) | 400ms 2s']) //
            .start($div[0], function() {
                $div.remove()
            });

            
	return;


	new ruqq.animate.Model3([{
		model: '-webkit-transform | translate3d(0px, 0px, 0px) > translate3d(100px, 100px, 0px) | 1s linear',
		next: {
			model: [{
				model: [{
					model: '-webkit-transform | translate3d(100px, 100px, 0px) scale(1) > translate3d(100px, 100px, 0px) scale(.2) | 1s linear',
				}, {
					model: 'border-radius | 0% > 90% | 1s linear' ,
					next: {
						model: 'border-radius | 90% > 0% | 1s linear'
					}
				}],

				next: {
					model: '-webkit-transform | translate3d(100px, 100px, 0px) scale(.2) > translate3d(100px, 100px, 0px) scale(1.2) | 1s linear'
				}
			}, {
				model: 'background-color | rgb(0,0,0) > rgb(200,0,200) | 1s linear'
			}],
			next: 'opacity | 1 > .2 | 200ms'/*{
				model: 'opacity | 1 > .2 | 200ms'
			}*/
		}
	},'font-size | 10px > 50px | 3s']).start($div[0], function() {
		console.log("done")
	});
});