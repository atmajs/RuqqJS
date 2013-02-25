global.window = {location:{
	set hash (value){
		this._hash = '#' + value;
		global.window.onhashchange();
	},
	get hash (){
		return this._hash;
	}
}};


require('../lib/routes.js');

var buster = require('buster'),
	Routes = global.window.routes;



function change(hash){
	global.window.location.hash = hash;
}


buster.testCase('rootHandler', {
	'adding literals' : function(){

		Routes = global.window.routes;
		Routes.clear();
		
		var that = this,
			create = function(){
				return spy = that.spy(function(){
					//console.log(arguments);
				});
			}, 
			spy;

		Routes.add('/user', create());
		change('/user');
		assert(spy.calledOnce);
		



		Routes.add('/:name', create());
		change('/alex');
		assert(spy.calledOnce);
		assert(spy.calledWith({name: 'alex'}));


		Routes.add('/?:name', create());
		change('/myname');
		assert(spy.calledOnce, '/?:name failed');
		assert(spy.calledWith({name: 'myname'}));


		Routes.add('/:name/?:number', create());
		change('/alex');
		assert(spy.calledOnce);
		assert(spy.calledWith({name: 'alex', number: ''}));

		Routes.add('/:name/?:number', create());
		change('/alex/10');
		assert(spy.calledOnce);
		assert(spy.calledWith({name: 'alex', number: '10'}));
	},

	'sub handlers': function(){

		Routes = global.window.routes;
		Routes.clear();

		var that = this,
			create = function(){
				return spy = that.spy(function(){
					//console.log(arguments);
				});
			}, 
			spy;


		Routes = Routes.createHandler('/user');

		Routes.add('/:id', create());
		change('/user/alex');

		assert(spy.calledOnce);
		assert(spy.calledWith({id: 'alex'}));

		
		Routes.clear();
		Routes.add('/:id', create());

		Routes.navigate('/me');

		assert(spy.calledOnce);
		assert(spy.calledWith({id: 'me'}));


	}
})

