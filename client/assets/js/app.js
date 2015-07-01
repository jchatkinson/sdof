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
	  		mydata.period = 0.5;
	  		mydata.damping = 5;
	  		mydata.myexcitefunc = [];
	  	};
	angular
		.module('application')
  		.service('mydata', MyData);
	
	
	//define a function that creates a sine time series
	function createHarmonicTimeSeries(functype,T,A,hShift,vShift,dt,time) {
		var npts = Math.ceil(time / dt);
		var myseries = [];
		switch(functype) {
			case "sine":
				var eqn = function(A,T,hShift,t){
					return A*Math.sin(2*Math.PI/T*(t+hShift))+vShift;
				} 
				break;
			case "saw":
				var eqn = function(A,T,hShift,t){
					return -2*A/Math.PI*Math.atan( 1/Math.tan( ( t+hShift )*Math.PI/T ) ) + vShift;
				} 
				break;
			case "square":
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
		//add 10 seconds of additional points of zeros
		var extraPts = Math.ceil(10/dt); 
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
		vm.selectedfrcfun = vm.frcfuns[0].name; 	
	 	vm.harmfuns = [{name:'sine', fullname:'Sine Wave'},{name:'saw', fullname:'Sawtooth Wave'},{name:'square', fullname:'Square Wave'}];
	    vm.mydata.myexcitefunc.selectedharmfun = vm.harmfuns[0].name; // default to sine function
	    vm.mydata.myexcitefunc.T = 5;
	    vm.mydata.myexcitefunc.A = 1.0; 
	    vm.mydata.myexcitefunc.Ph = 0;
	    vm.mydata.myexcitefunc.dt = 0.1;
	    vm.mydata.myexcitefunc.totalTime = 10.0;
	    vm.mydata.myexcitefunc.SF = 1.0;
	    vm.mydata.myexcitefunc.vShift = 0;
	    vm.mydata.myexcitefunc.hShift = 0;
	    vm.mydata.myexcitefunc.series = createHarmonicTimeSeries( vm.mydata.myexcitefunc.selectedharmfun, vm.mydata.myexcitefunc.T, vm.mydata.myexcitefunc.A, vm.mydata.myexcitefunc.hShift, vm.mydata.myexcitefunc.vShift, vm.mydata.myexcitefunc.dt, vm.mydata.myexcitefunc.totalTime);
  	};
	angular
		.module('application')
		.controller('ExcitationCtrl',ExcitationCtrl);
	
	//define a controller for the System template that uses the mydata service
	function SystemPropCtrl(mydata) {
		var system = this;		
		system.mydata = mydata;
		system.w = function() {return Math.round(2*Math.PI / system.mydata.period*1000)/1000};	
		system.f = function() {return 1/system.mydata.period};
	};
	angular
		.module('application')	
		.controller('SystemPropCtrl', SystemPropCtrl);  
  	
  	//define a controller for the excitation plot
 	function LineCtrl(mydata) {
 		var vm = this;
 		vm.mydata = mydata;
		//vm.plotdata = [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:4,y:0},{x:5,y:0}];
	    vm.plotoptions = {
			series: [{y: "y",label: 'My forcing function',color: "#1f77b4",type: "area"}]
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
