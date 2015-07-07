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
  		mydata.funtypes = [	{name:'sine', fullname:'Sine Wave',type:'Harmonic',note:''},
			{name:'saw', fullname:'Sawtooth Wave',type:'Harmonic',note:''},
			{name:'square', fullname:'Square Wave',type:'Harmonic',note:''},
			{name:'rampup', fullname:'Ramp Up',type:'Impulse',note:''},
			{name:'rampdn', fullname:'Ramp Down',type:'Impulse',note:''},
 			{name:'acc',fullname:'File Containing Accelerations',type:'From File',note:'Note: The file must formatted such that each row contains <code>[acceleration]</code> at a specified time interval'},
 			{name:'timeacc',fullname:'File Containing Time and Acceleration',type:'From File',note:'Note: The file must formatted such that each row contains <code>[time,acceleration]</code>'},
 			{name:'peernga',fullname:'PEER NGA File',type:'From File',note:'Note: The file must formatted as an unaltered <a href="http://ngawest2.berkeley.edu/" target="_blank">PEER NGA Record</a>'}
 			];
  		mydata.eFun = mydata.funtypes[0];
	    mydata.eT = 1.0;
	    mydata.eA = 1.0; 
	    mydata.edt = 0.01;
	    mydata.eTotalTime = 25.0;
	    mydata.eExciteTime = 20;
	    mydata.eSF = 1.0;
	    mydata.eVShift = 0;
	    mydata.eHShift = 0;
	    mydata.eSeries = [{x:0,y:0},{x:1,y:0}];
  		mydata.response = analyzeSystem(mydata.sT,mydata.sDamp,mydata.eSeries,mydata.edt,mydata.eTotalTime);
		mydata.rawfile = '';
		mydata.procfile = [];
  	};
	angular
		.module('application')
  		.service('mydata', MyData);
	
	//define a function that creates a sine time series
	function createTimeSeries(mydata) {
		
		var npts = Math.ceil(mydata.eExciteTime / mydata.edt);
		var functype = mydata.eFun.name;		
		mydata.eSeries = [];
		switch(functype) {
			case 'sine':
				var eqn = function(mydata,t){
					return mydata.eA*Math.sin(2*Math.PI/mydata.eT*(t+mydata.eHShift))+mydata.eVShift;
				} 
				break;
			case 'saw':
				var eqn = function(mydata,t){
					return -2*mydata.eA/Math.PI*Math.atan( 1/Math.tan( ( t+mydata.eHShift )*Math.PI/mydata.eT ) ) + mydata.eVShift;
				} 
				break;
			case 'square':
				var eqn = function(mydata,t){
					return mydata.eA*( 2*Math.floor((t+mydata.eHShift)/mydata.eT) - Math.floor(2*(t+mydata.eHShift)/mydata.eT) + 1 )+mydata.eVShift;
				} 
				break;
			case 'rampup':
				var eqn = function (mydata,t) { 
					if (t <= mydata.eExciteTime) { 					
						 return mydata.eA * t / mydata.eExciteTime;
					} else { 
						return 0; 
					};
				}
				break;
			case 'rampdn':
				var eqn = function (mydata,t) { 
					if (t <= mydata.eExciteTime) { 					
						 return mydata.eA - mydata.eA * t / mydata.eExciteTime;
					} else { 
						return 0; 
					};
				}
				break;
			case 'acc': //mydata.procfile is array of acc values [a1,a2,a3,...]
				var eqn = function (mydata,t) { 
					if (mydata.procfile.length > 0 && t <= mydata.eExciteTime && t<=mydata.edt*mydata.procfile.length) {
						return mydata.eSF*mydata.procfile[Math.round(t / mydata.edt)];
					} else {
						return 0;
					};
				}				
				break;
			case 'timeacc': //mydata.procfile is array of [t1,a1,t2,a2,..]
				var eqn = function (mydata,t) { 
					if (mydata.procfile.length > 0 &&  t <= mydata.eExciteTime && t<=mydata.procfile[mydata.procfile.length-1]) {
						//time could be unevenly spaced, so need to interp values
						var times = mydata.procfile; 
						var accs = times;
						for(var ind=0; ind<times.length; ind++){ 
							times.splice(i,1); 
							accs.splice(i+1,1); 
						};
						//find index of times array corresponding to t
						var min = Math.abs(times[0]-t);
						var i1 = 0;
						var i2 = 0;
						for (var i = 1; i < times.length; i++) {
						    if (Math.abs(times[i]-t) < min) {
						        i1 = i;
						        if(times[i] > t){ i2 = i-1; } else{ i2 = i+1; };
						        min = Math.abs(times[i]-t);
						    };
						};			
						var ag = (accs[i1] - accs[i2]) * (t - times[i2]) / (times[i1] - times[i2]) + accs[i2];							
						return mydata.eSF*ag;
					} else {
						return 0;
					};
				}				
				break;
			case 'peernga': //procfile is string of acc values [a1,a2,a3,...]
				var eqn = function (mydata,t) { 
					if (mydata.procfile.length > 0 && t <= mydata.eExciteTime && t<=mydata.edt*mydata.procfile.length) {
						return mydata.eSF*mydata.procfile[Math.round(t / mydata.edt)];
					} else {
						return 0;
					};
				}				
				break;			
			}; 
		var yt=0.0;
		var i,t;
		for (i=0; i<npts-1; i++) {
			t=i*mydata.edt;
			yt = eqn(mydata,t);
			mydata.eSeries.push({
				x:t,
				y:yt
			}); 			
		}
		//add additional points of zeros if eTotalTime > eExciteTime
		if (mydata.eTotalTime > mydata.eExciteTime) {
			for (i=npts; i<npts+Math.ceil((mydata.eTotalTime - mydata.eExciteTime)/mydata.edt); i++) {
				t=i*mydata.edt;
				mydata.eSeries.push({
					x:t,
					y:0.0
				}); 			
			}	
		};
		return mydata;
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
	 	vm.datacheckbox = false;
	 	vm.updateTS = function () {
	 		createTimeSeries(mydata);
 		};
 		vm.updateTS();
	 	vm.isFunSelected = function(ind){
	 		if (typeof ind === 'number') {
	 			return vm.mydata.eFun === vm.mydata.funtypes[ind];
	 		} else {
	 			var i,isit; 
	 			isit = false; 
	 			for (i=0; i<ind.length; i++) {
	 				isit = (isit || vm.mydata.eFun===vm.mydata.funtypes[ind[i]]);
	 			};
	 			return isit;
	 		};
	 	};
	 	vm.showContent = function ($fileContent,mydata) {
			var procfile, str, line, vals;		 	
		 	vm.mydata.rawfile = $fileContent;
		 	vm.mydata.procfile = [];
		 	procfile = vm.mydata.rawfile.replace(/-\./g,"-0.");
	        procfile = procfile.replace(/\s\./g,"0.");
	        procfile = procfile.split(/\n/);
	        var patt = new RegExp(/[A-z]{2,}/);
	        for ( line=0; line < procfile.length; line++) {
				if (! patt.test(procfile[line]) ) { //check line doesn't contain text
					vals = procfile[line].split(/[\s,;\t]+/);					
					vm.mydata.procfile.push.apply(vm.mydata.procfile,vals);
				};	        
	        };
			//remove any empty strings
	        for (line=0; line < vm.mydata.procfile.length; line++) { 
		    	if(vm.mydata.procfile[line] === "") {
		    		vm.mydata.procfile.splice(line,1); 
		    		line--;
		    	}; 
	        };
	        //convert array elements from strings to numbers
	        vm.mydata.procfile = vm.mydata.procfile.map(Number);
 		};
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
	  		vm.mydata.response = analyzeSystem(vm.mydata.sT,vm.mydata.sDamp,vm.mydata.eSeries,vm.mydata.edt,vm.mydata.eTotalTime);
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
  	
	//directive for file selection 	
	 angular
	 	.module('application')
	 	.directive('onReadFile', function ($parse) {
			return {
				restrict: 'A',
				scope: false,
				link: function(scope, element, attrs) {
		            var fn = $parse(attrs.onReadFile);
		            
					element.on('change', function(onChangeEvent) {
						var reader = new FileReader();
		                
						reader.onload = function(onLoadEvent) {
							scope.$apply(function() {
								fn(scope, {$fileContent:onLoadEvent.target.result});
							});
						};
		
						reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
					});
				}
			};
		});
  		
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
