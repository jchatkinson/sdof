(function() {
  'use strict';

	angular.module('application', [
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations'
    
    //my dependancies

  ])
	.controller('SystemPropCtrl' , ['$scope', function($scope) {
		$scope.system = { period: 0.5, damping: 5 };	
	}])  
	
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
		    $scope.myharmfun = $scope.harmfuns[0].name; // default to sine function
  	}])
  
//  .controller('ResponseCtrl', ['$scope', function($scope) {
//
//  }])  
  
  
  
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
