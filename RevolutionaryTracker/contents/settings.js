( function(){

	//Variable Declarations
	var page=document.getElementById("settings");
	var popupCircle2 = page.querySelector("#moreoptionsPopupCircle2"),
	elSelector2 = page.querySelector("#selector2"),
	selector2,
	clickHandlerBound;
	var watchId;

	//Events for options click
	elSelector2.addEventListener("click", function(event) {
		debugger;
		var target = event.target;
		if(target.id=="Configuration")
		{
			console.log("configuration");
			tau.changePage("configurations.html");
		}else if(target.id=="battery"){
			console.log("battery");
			localStorage.setItem("alertText", Math.floor(navigator.battery || navigator.mozBattery || navigator.webkitBattery.level * 100) + '%');                //Alert Stuff
			tau.changePage("alert.html");
			var battery=Math.floor(navigator.battery || navigator.mozBattery || navigator.webkitBattery.level * 100) + '%';
			localStorage.setItem("battery", Math.floor(navigator.battery || navigator.mozBattery || navigator.webkitBattery.level * 100));
		}else if(target.id=="signalstrength"){
			console.log("signal Strength");
			tizen.systeminfo.getPropertyValue("WIFI_NETWORK", onSuccessCallbackwifi, onErrorCallback);
		}else if(target.id=="location"){
			console.log("location");
			tau.changePage("location.html");
		}else if(target.id==="steps")
		{		
			var steps=window.localStorage.getItem("pedoSteps");
			if(steps===undefined){
				steps=0;
			}
			//console.log(steps+"steps");
			tau.changePage("steps.html");
		}
		else if(target.id==="hrm")
		{
			tau.changePage("HRM.html");
		}




		//Events for center Text click
		if (tau.support.shape.circle) {
			debugger;
			if (target.classList.contains("ui-selector-indicator")) {
				if(target.innerText=="Steps")
				{
					var steps=window.localStorage.getItem("pedoSteps");
					if(steps===undefined){
						steps=0;
					}
					//console.log(steps+"steps");
					tau.changePage("steps.html");

				}else if(target.innerText=="HRM")
				{
					tau.changePage("HRM.html");
				}else if(target.innerText=="Configuration")
				{
					console.log("Configuration");
					tau.changePage("configurations.html");
				}else if(target.innerText=="Battery"){
					console.log("battery");
					localStorage.setItem("alertText", Math.floor(navigator.battery || navigator.mozBattery || navigator.webkitBattery.level * 100) + '%');                //Alert Stuff
					tau.changePage("alert.html");
					var battery=Math.floor(navigator.battery || navigator.mozBattery || navigator.webkitBattery.level * 100) + '%';
					localStorage.setItem("battery", Math.floor(navigator.battery || navigator.mozBattery || navigator.webkitBattery.level * 100));
				}else if(target.innerText=="Signal Strength"){
					console.log("signal Strength");
					tizen.systeminfo.getPropertyValue("WIFI_NETWORK", onSuccessCallbackwifi, onErrorCallback);
				}else if(target.innerText=="GPS"){
					console.log("location");
					tau.changePage("location.html");
					//navigator.geolocation.getCurrentPosition(success, error, options);
				}

			}

		}
	});

	//Page beforeshow
	page.addEventListener("pagebeforeshow", function() {
		var radius = window.innerHeight / 2 * 0.8;
		if (tau.support.shape.circle) {
			selector2 = tau.widget.Selector(elSelector2, {itemRadius: radius});
		}
		watchFunc();                                 //Starting GPS watch

	});

	//Page aftershow
	page.addEventListener("pageshow", function() {
		tau.openPopup(popupCircle2);
	});

	//Page beforehide
	page.addEventListener("pagebeforehide", function(event) {
		stopWatchFunc();                            //Stoping GPS watch
	});


	//getBattery info Success
	function onSuccessCallback(battery) {
		console.log("Battery Level: " + battery.level + "\nIs Charging: "
				+ battery.isCharging);
		localStorage.setItem("alertText", Math.floor(battery.level* 100) + '%');                //Alert Stuff
		tau.changePage("alert.html");
		localStorage.setItem("battery", Math.floor(battery.level* 100));
		localStorage.setItem("isCharging", battery.isCharging);

	}

	//getBattery info Error
	function onErrorCallback(error) {
		console.log("Not supported: " + error.message);
	}



	//Wifi signal Strength onsuccess
	function onSuccessCallbackwifi(wifi) {
		console.log("Status: " + wifi.status +  "    SSID: " + wifi.ssid
				+ "\nIP Address: " + wifi.ipAddress + "\nIPV6 Address: " + wifi.ipv6Address + "    Signal Strength: " + wifi.signalStrength);

		localStorage.setItem("wifiStrength", JSON.stringify(wifi.signalStrength));
		localStorage.setItem("alertText", Math.round((wifi.signalStrength===undefined)?0:wifi.signalStrength));                //Alert Stuff
		tau.changePage("alert.html");
		console.log("Status: " + wifi.status +  "    SSID: " + wifi.ssid
				+ "\nIP Address: " + wifi.ipAddress + "\nIPV6 Address: " + wifi.ipv6Address + "    Signal Strength: " + wifi.signalStrength);
	}

	//Wifi signal Strength onError
	function onErrorCallback(error) {
		console.log("Not supported: " + error.message);
	}
	
	

//	Convert km/h to knot(Speed)
	var convert = (function () {
		var conversions = {
				speed: {
					ms:    1, // use m/s as our base unit
					kmh:   3.6,
					mph:   2.23693629,
					knots: 1.94384449
				},

				distance: {
					m:      1, // use meters as our base
					inches: 39.3700787402, // can't use "in" as that's a keyword. Darn.
					ft:     3.280839895,
					mi:     0.000621371192,
					nm:     0.000539956803 // nautical miles, not nanometers
				},

				mass: {
					g:  1, // use grams as our base
					lb: 0.002204622622,
					oz: 0.0352739619
				}
		};

		function Unit(type, unit, base) {
			this.value = base * conversions[type][unit];
			this.to = {};
			for(var otherUnit in conversions[type]) {
				(function (target) {
					this.to[target] = function () {
						return new Unit(type, target, base);
					}
				}).call(this, otherUnit);
			}
		}

		Unit.prototype = {
				yield: function () {
					return this.valueOf();
				},

				toString: function () {
					return String(this.value);
				},

				valueOf: function () {
					return this.value;
				}
		};

		// my god, it's full of scopes!
		var types = {};
		for(var type in conversions) {
			(function (type) {
				types[type] = function (value) {
					var units = {};
					for(var unit in conversions[type]) {
						(function (unit) {
							units[unit] = function () {
								return new Unit(type, unit, value / conversions[type][unit]);
							}
						}(unit));
					}
					return units;
				};
			}(type));
		}

		return types;
	}());



	
	
	//GPS location Stuff
	function oneShotFunc() 
	{
		if (navigator.geolocation) 
		{
			navigator.geolocation.getCurrentPosition(successCallback, errorCallback, 
					{maximumAge: 60000});
		} 
		else 
		{
			console.log("Geolocation is not supported.");
		}
	}


	function watchFunc() 
	{
		if (navigator.geolocation) 
		{
			watchId = navigator.geolocation.watchPosition(successCallback, errorCallback);
		} 
		else 
		{
			console.log("Geolocation is not supported.");
		}
	}
	
	
	function stopWatchFunc() 
	{
	   if (navigator.geolocation) 
	   {
		   //alert("stopped settings");
	      navigator.geolocation.clearWatch(watchId);
	   } 
	   else 
	   {
	      document.getElementById("locationInfo").innerHTML = "Geolocation is not supported.";
	   }
	}



	function successCallback(position) 
	{
		console.log(position);
		var date = new Date(position.timestamp*1000);
		//console.log(date.getHours()+" "+date.getMinutes());
		localStorage.setItem("accuracyGPS", position.coords.accuracy);
		localStorage.setItem("latitude",  position.coords.latitude);
		localStorage.setItem("longitude", position.coords.longitude);
		localStorage.setItem("altitudeGPS", position.coords.altitude);
		localStorage.setItem("LastGPSdate", new Date());
		
		var speed=position.coords.speed;
		//debugger;
		//speed=convert.speed(speed).ms().to.mph();    //Converting speed m/s to m/h
		speed=convert.speed(speed).ms().to.knots();    //Converting speed m/s to knots
		speed=Math.round(speed);
		localStorage.setItem("speedGPS", speed);
	}

	function errorCallback(error) 
	{
		switch (error.code) 
		{
		case error.PERMISSION_DENIED:         
			console.log("User denied the request for Geolocation.");
			break;
		case error.POSITION_UNAVAILABLE:
			console.log("Location information is unavailable.");
			break;
		case error.TIMEOUT:
			console.log( "The request to get user location timed out.");
			break;
		case error.UNKNOWN_ERROR:
			console.log("An unknown error occurred.");
			break;
		}
	}
	
	


})();