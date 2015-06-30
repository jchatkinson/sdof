(function() {
  'use strict';

	angular.module('application', [
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations',
    
    //my dependancies
	'n3-line-chart'
  ])
  
  
  	//define a service to share data across controllers / views
  	.service("mydata", function MyData() {
  		var mydata = this;
  		mydata.period = 1.5;
  		mydata.damping = 5;
  	})
	
	//define a controller for the System template that uses the mydata service
	.controller("SystemPropCtrl" , ['mydata',function SystemPropCtrl(mydata) {
		var system = this;		
		system.mydata = mydata;
		system.w = function() {return Math.round(2*Math.PI / system.mydata.period*1000)/1000};	
		system.f = function() {return 1/system.mydata.period};
	}])  
	
	//define a controller for the Excitation template that uses the mydata service
	 .controller('ExcitationCtrl', ['$scope', function($scope) {
    	$scope.excitations = ['Harmonic','Impulse','From File'];
		$scope.myexcitation = $scope.excitations[0]; // default to harmonic function
	 	$scope.harmfuns = [
    		{name:'sine', fullname:'Sine Wave'},
      		{name:'saw', fullname:'Sawtooth Wave'},
      		{name:'square', fullname:'Square Wave'}
      		];
		    $scope.hfunT = 0.5;
		    $scope.hfunA = 9.8; 
		    $scope.hfunPh = 0;
		    $scope.hfundt = 0.01;
		    $scope.hfunTtotal = 5.0;
		    $scope.myharmfun = $scope.harmfuns[0].name; // default to sine function
  	}])
  	
  	
  	//define a controller for the excitation plot
  	.controller('LineCtrl', function($scope) {
		    $scope.data = [{x:0,val_0:0},{x:1,val_0:0.993},{x:2,val_0:1.947},{x:3,val_0:2.823},{x:4,val_0:3.587},{x:5,  val_0:4.207},{x:6,  val_0:4.66},{x:7,  val_0:4.927},{x:8,  val_0:4.998},{x:9,val_0:4.869},{x:10,val_0:4.546},{x:11,val_0:4.042},{x:12,val_0:3.377},{x:13,val_0:2.578},{x:14,val_0:1.675},{x:15,val_0:0.706}];	
		    $scope.options = {
		      series: [{y: "val_0",label: 'My forcing function',color: "#1f77b4",type: "area"}]
		    };
	})
  	
  	//define a controller for the Response template that uses the MyData service
  	.controller('ResponseCtrl' , ['mydata',function(mydata) {
		var response = this;
		response.mydata = mydata;
	}])  
  
    .config(config)
    .run(run)
  ;

  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function config($urlProvider, $locationProvider) {
    $urlProvider.otherwise('/');

    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');
  }

  function run() {
    FastClick.attach(document.body);
  }

})();
