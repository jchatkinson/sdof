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
	    mydata.eT = 1.0;
	    mydata.eA = 1.0; 
	    mydata.edt = 0.01;
	    mydata.etotalTime = 5.0;
	    mydata.eSF = 1.0;
	    mydata.eVShift = 0;
	    mydata.eHShift = 0;
	    mydata.eSeries = createHarmonicTimeSeries( mydata.eFun.subtype, mydata.eT, mydata.eA, mydata.eHShift, mydata.eVShift, mydata.edt, mydata.etotalTime);
  		mydata.response = analyzeSystem(mydata.sT,mydata.sDamp,mydata.eSeries,mydata.edt,mydata.etotalTime);
	  	//mydata.onChange = function () {
	  	//	mydata.eSeries = createHarmonicTimeSeries( mydata.eFun.subtype, mydata.eT, mydata.eA, mydata.eHShift, mydata.eVShift, mydata.edt, mydata.etotalTime);
	  	//}
		//mydata.fileupload = function(){
		//	var userfile = document.getElementById("userfile").files[0];
	    //    var reader = new FileReader();
	    //  	reader.onloadend = function(){
	    //    	mydata.eSeries = reader.result;
	    //  	}
	    //  	reader.readAsText(userfile);
	    //}	  		  	
	  	//mydata.calcResponse = function() {
	  	//	mydata.response = analyzeSystem(mydata.sT,mydata.sDamp,mydata.eSeries,mydata.edt,mydata.etotalTime);
	  	//}
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
	
	//define a function to analyze the system
	function analyzeSystem(T,zeta,ag,dt,ttotal) {
		//check if zeta is in decimal or percent notation
		if (zeta > 1.0) {
			zeta = zeta/100.0
		};
		var t = 0;
		var npts_ag = ag.length;
		var npts_total = Math.ceil(ttotal/dt);
		var w = 2*Math.PI/T;
		var m=1000; 
		var k = w*w*m;
		var wd = w*Math.sqrt(1.0-zeta*zeta);
		var e = Math.exp(-zeta*w*dt);
		var s = Math.sin(wd*dt);
		var c = Math.cos(wd*dt);
		//set inital conditions
		var u=[{x:0,y:0}];
		var v=[{x:0,y:0}];
		var pr = [{x:0,y: k*u[0].y}];
		var y0 = -ag[0].y - 2.0*zeta*w*v[0].y - pr[0].y/m;
		var a=[{x:0,y:y0}];
		//recurrence formula coefficiencts
		var A  = e*(zeta/Math.sqrt(1.0-zeta*zeta)*s + c);
    	var B  = e*(1.0/wd*s);
    	var C  = -1.0/(w*w)*(2.0*zeta/(w*dt) + e*(((1.0-2.0*zeta*zeta)/(wd*dt) - zeta/Math.sqrt(1.0-zeta*zeta))*s - (1.0+2.0*zeta/(w*dt))*c));
    	var D  = -1.0/(w*w)*(1.0-2.0*zeta/(w*dt) + e*((2.0*zeta*zeta-1.0)/(wd*dt)*s + 2.0*zeta/(w*dt)*c));
    	var Ap = -e*(w/Math.sqrt(1.0-zeta*zeta)*s);
    	var Bp = e*(c-zeta/Math.sqrt(1.0-zeta*zeta)*s);
    	var Cp = -1.0/(w*w)*(-1.0/dt + e*((w/Math.sqrt(1.0-zeta*zeta) + zeta/(dt*Math.sqrt(1.0-zeta*zeta)))*s + 1.0/dt*c));
    	var Dp = -1.0/(w*w*dt)*(1.0 - e*(zeta/Math.sqrt(1.0-zeta*zeta)*s+c));
    	//loop through each steps
    	var i;
    	var agi;
		var agip1;
    	for (i=0; i<npts_total-1; i++) {
    		agi = (i<npts_ag) ? ag[i].y : 0.0;
        	agip1 = (i<npts_ag-1) ? ag[i+1].y : 0.0;
        	t = i*dt;
        	u.push({x:t, y: A * u[i].y + B * v[i].y + C * agi + D * agip1});
        	v.push({x:t,y:Ap * u[i].y + Bp * v[i].y + Cp * agi + Dp * agip1});
			pr.push({x:t,y:k*u[i+1].y}); 
			a.push({x:t,y:-agip1 - 2.0*zeta*w*v[i+1].y - pr[i+1].y/m});
    	};
		return {
			u: u,		
			v: v,
			a: a
		};
	}
	
	//define a controller for the Excitation template that uses the mydata service
	function ExcitationCtrl(mydata) {
    	var vm = this;
    	vm.mydata = mydata;
    	vm.funtypes = [{name:'harmonic',fullname:'Harmonic Function'},{name:'impulse',fullname:'Impulse Load'},{name:'file',fullname:'Time History File'}];
    	vm.funsubtypes = function () {
    		if ( vm.isTypeSelected(0) ) { 
    			return [{name:'sine', fullname:'Sine Wave'},{name:'saw', fullname:'Sawtooth Wave'},{name:'square', fullname:'Square Wave'}];
			};
    		if ( vm.isTypeSelected(1) ) {  
    			return [{name:'rampup', fullname:'Ramp Up'},{name:'rampdn', fullname:'Ramp Down'}];
    		};
    		if ( vm.isTypeSelected(2) ) {  
    			return [{name:'peer',fullname:'PEER NGA File',note:'Note: The file must formatted as an unaltered <a href="http://ngawest2.berkeley.edu/" target="_blank">PEER NGA Record</a>'},
 						{name:'acc',fullname:'Acceleration',note:'Note: The file must formatted such that each row contains <code>[acceleration]</code> at a specified time interval'},
 						{name:'timeacc',fullname:'Time and Acceleration',note:'Note: The file must formatted such that each row contains <code>[time,acceleration]</code>'}];
    		};    		
    	};
	 	vm.isSubtypeSelected = function (checkind) {
	 		vm.funsubtypes();
	 		return vm.mydata.eFun.subtype === vm.funsubtypes[checkind].name;
	 	};
	 	vm.isTypeSelected = function(checkind){
	 		return vm.mydata.eFun.type === vm.funtypes[checkind].name;
	 	};
	 	vm.fileupload = function(){
			var userfile = document.getElementById("userfile").files[0];
	        var reader = new FileReader();
	      	reader.onloadend = function(){
	       		vm.mydata.eSeries = reader.result;
	       		
	      	};
	      	reader.readAsText(userfile);
	    };	  		     	
    	//mydata.onChange = function () {
	  	//	mydata.eSeries = createHarmonicTimeSeries( mydata.eFun.subtype, mydata.eT, mydata.eA, mydata.eHShift, mydata.eVShift, mydata.edt, mydata.etotalTime);
	  	//}
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
  	
  	//define a controller for the Response template that uses the MyData service
  	function ResponseCtrl(mydata) {
		var vm = this;
		vm.mydata = mydata;
		vm.calcResponse = function() {
	  		vm.mydata.response = analyzeSystem(vm.mydata.sT,vm.mydata.sDamp,vm.mydata.eSeries,vm.mydata.edt,vm.mydata.etotalTime);
	  	};
		
	};
	angular
		.module('application')		
  		.controller('ResponseCtrl' , ResponseCtrl);
  		  	
  	//define a controller for plots
 	function LineCtrl(mydata) {
 		var vm = this;
 		vm.mydata = mydata;
	    vm.plotoptions = {
	    	//axes: {x: {key: 'x', min: 0, max: vm.mydata.etotalTime}},
			series: [{y: "y",label: "My forcing function",color: "#1f77b4",type: "line",thickness:"1px"}],
	    	drawLegend: false,
	    	drawDots: false,
	    	hideOverflor: true
	    };
	};
	angular
		.module('application')		
  		.controller('LineCtrl', LineCtrl);
  		
  	
	//filter for displaying 'unsafe' html with ng-bind-html
	 function UnSafeHTML($sce) {
	 	return function(val){
	 		return $sce.trustAsHtml(val);
	 	};
	 };
	 angular
	 	.module('application')
	 	.filter('unsafe',UnSafeHTML); 	
  		
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
