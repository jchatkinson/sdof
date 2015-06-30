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
	
	//define a controller for the Excitation template that uses the mydata service
	function ExcitationCtrl(mydata) {
    	var excite = this;
    	excite.mydata = mydata;
    	excite.frcfuns = [{name:'harmonic',fullname:'Harmonic Function'},{name:'impulse',fullname:'Impulse Load'},{name:'file',fullname:'Time History from File'}];
		excite.selectedfrcfun = excite.frcfuns[0].name; 	
	 	excite.harmfuns = [{name:'sine', fullname:'Sine Wave'},{name:'saw', fullname:'Sawtooth Wave'},{name:'square', fullname:'Square Wave'}];
	    excite.selectedharmfun = excite.harmfuns[0].name; // default to sine function
	    excite.T = 0.5;
	    excite.A = 9.8; 
	    excite.Ph = 0;
	    excite.dt = 0.01;
	    excite.totalTime = 5.0;
	    excite.SF = 1.0;
	    //function to push the excitefunc options to mydata
	    excite.submit = function () {
	    		//clear the existing mydata.myexcitefunc
	    	
	    		//push the required info to mydata.myexcitefunc
	    };
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
  	function LineCtrl($scope) {
		    //$scope.data = [{x:0,val_0:0},{x:1,val_0:0.993},{x:2,val_0:1.947},{x:3,val_0:2.823},{x:4,val_0:3.587},{x:5,  val_0:4.207},{x:6,  val_0:4.66},{x:7,  val_0:4.927},{x:8,  val_0:4.998},{x:9,val_0:4.869},{x:10,val_0:4.546},{x:11,val_0:4.042},{x:12,val_0:3.377},{x:13,val_0:2.578},{x:14,val_0:1.675},{x:15,val_0:0.706}];	
		    $scope.data = [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:4,y:0},{x:5,y:0}];
		    $scope.options = {
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
