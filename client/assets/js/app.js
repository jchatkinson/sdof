(function() {
  	'use strict';

	angular
		.module('application', [
		    'ui.router','ngAnimate',
		    //foundation
		    'foundation','foundation.dynamicRouting','foundation.dynamicRouting.animations',
		    //my dependancies
			'n3-line-chart']);
  	
  	//define a service to share data across controllers / views		
  	function MyData() {
  		var mydata = this;
  		mydata.sT = 0.5;
  		mydata.sDamp = 5;
  		mydata.eFun = {type:'harmonic',subtype:'sine'}; // default to sine function
	    mydata.eT = 5;
	    mydata.eA = 1.0; 
	    mydata.edt = 0.1;
	    mydata.etotalTime = 10.0;
	    mydata.eSF = 1.0;
	    mydata.eVShift = 0;
	    mydata.eHShift = 0;
	    mydata.eSeries = createHarmonicTimeSeries( mydata.eFun.subtype, mydata.eT, mydata.eA, mydata.eHShift, mydata.eVShift, mydata.edt, mydata.etotalTime);
	  	mydata.update = function () {
	  		mydata.eSeries = createHarmonicTimeSeries( mydata.eFun.subtype, mydata.eT, mydata.eA, mydata.eHShift, mydata.eVShift, mydata.edt, mydata.etotalTime);
	  	}
  	};
	angular
		.module('application')
  		.service('mydata', MyData);
	
	//define a function that creates a sine time series
	function createHarmonicTimeSeries(functype,T,A,hShift,vShift,dt,time) {
		var npts = Math.ceil(time / dt);
		var myseries = [];
		switch(functype) {
			case 'sine':
				var eqn = function(A,T,hShift,t){
					return A*Math.sin(2*Math.PI/T*(t+hShift))+vShift;
				} 
				break;
			case 'saw':
				var eqn = function(A,T,hShift,t){
					return -2*A/Math.PI*Math.atan( 1/Math.tan( ( t+hShift )*Math.PI/T ) ) + vShift;
				} 
				break;
			case 'square':
				var eqn = function(A,T,hShift,t){
					return A*( 2*Math.floor((t+hShift)/T) - Math.floor(2*(t+hShift)/T) + 1 )+vShift;
				} 
				break;
			} 
		var yt=0;
		var i;
		for (i=0; i<npts-1; i++) {
			var t=i*dt
			yt = eqn(A,T,hShift,t);
			myseries.push({
				x:t,
				y:yt
			}); 			
		}
		//add 1 seconds of additional points of zeros
		var extraPts = Math.ceil(1/dt); 
		for (i=npts; i<npts+extraPts; i++) {
			t=i*dt
			myseries.push({
				x:t,
				y:0
			}); 			
		}		
		return myseries;
	}
	
	
	//define a controller for the Excitation template that uses the mydata service
	function ExcitationCtrl(mydata) {
    	var vm = this;
    	vm.mydata = mydata;
    	vm.frcfuns = [{name:'harmonic',fullname:'Harmonic Function'},{name:'impulse',fullname:'Impulse Load'},{name:'file',fullname:'Time History from File'}];	
	 	vm.harmfuns = [{name:'sine', fullname:'Sine Wave'},{name:'saw', fullname:'Sawtooth Wave'},{name:'square', fullname:'Square Wave'}];
	 	vm.impfuns = [{name:'rampup', fullname:'Ramp Up'},{name:'rampdn', fullname:'Ramp Down'}];
	    };
	angular
		.module('application')
		.controller('ExcitationCtrl',ExcitationCtrl);
	
	//define a controller for the System template that uses the mydata service
	function SystemPropCtrl(mydata) {
		var system = this;		
		system.mydata = mydata;
		system.w = function() {return Math.round(2*Math.PI / system.mydata.sT*1000)/1000};	
		system.f = function() {return 1/system.mydata.sT};
	};
	angular
		.module('application')	
		.controller('SystemPropCtrl', SystemPropCtrl);  
  	
  	//define a controller for the excitation plot
 	function LineCtrl(mydata) {
 		var vm = this;
 		vm.mydata = mydata;
 		
	    vm.plotoptions = {
	    	//axes: {x: {key: 'x', min: 0, max: vm.mydata.etotalTime}},
			series: [{y: "y",label: "My forcing function",color: "#1f77b4",type: "area"}]
	    };
	};
	angular
		.module('application')		
  		.controller('LineCtrl', LineCtrl);
  	
  	//define a controller for the Response template that uses the MyData service
  	function ResponseCtrl(mydata) {
		var response = this;
		response.mydata = mydata;
	};
	angular
		.module('application')		
  		.controller('ResponseCtrl' , ResponseCtrl);
  		
  		
	//configure and build application
	angular
		.module('application')	  
	    .config(config)
	    .run(run);

  	config.$inject = ['$urlRouterProvider', '$locationProvider'];

  	function config($urlProvider, $locationProvider) {
    	$urlProvider.otherwise('/');
    	$locationProvider.html5Mode({
      		enabled:false,
      		requireBase: false
    	});
    	$locationProvider.hashPrefix('!');
  	};

  	function run() {
    	FastClick.attach(document.body);
  	};

})();
