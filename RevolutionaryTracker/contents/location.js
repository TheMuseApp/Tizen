(function(){
	var page=document.getElementById("locationPage");
	var counter = 0;
	//GPS Start
	var options = {
			enableHighAccuracy: true,
			timeout: 6000,
			maximumAge: 0
	};
	//Page BeforeShow
	page.addEventListener("pagebeforeshow", function() {

		$("#lat").text("120.00");
		$("#long").text("52.222");
		$("#accu").text("20");
		/*setTimeout(function(){
			 tau.openPopup("#1btnPopup");
		},2000);*/
		oneShotFunc();
		watchFunc();
	});

	
	//Wifi Stuff
	 function onSuccessCallback(wifi) {
	     console.log("Status: " + wifi.status +  "    SSID: " + wifi.ssid
	     + "\nIP Address: " + wifi.ipAddress + "\nIPV6 Address: " + wifi.ipv6Address + "    Signal Strength: " + wifi.signalStrength);
	     $("#strength").text( (wifi.signalStrength==undefined)?0:Math.round(wifi.signalStrength));
	     
	 }
	 
	  function onErrorCallback(error) {
		  console.log("Not supported: " + error.message);
	 }
	
	
	
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



	function successCallback(position) 
	{
		var date = new Date(position.timestamp*1000);
		$("#lat").text( position.coords.latitude);
		$("#long").text(position.coords.longitude);
		localStorage.setItem("latitude", JSON.stringify(position.coords.latitude));
		localStorage.setItem("longitude", JSON.stringify(position.coords.longitude));
		
		var speed=position.coords.speed;
			speed=convert.speed(speed).ms().to.mph();    //Converting speed k/h to m/h
		$("#speed").text(speed);
		$("#altitude").text(position.coords.altitude);
		$("#accu").text(position.coords.accuracy);
		localStorage.setItem("accuracy", JSON.stringify(position.coords.accuracy));
		localStorage.setItem("LastGPSdate", new Date());
		
		var speedknots=position.coords.speed;
		speedknots=convert.speed(speedknots).ms().to.knots();    //Converting speed m/s to knotsf
		speedknots=Math.round(speedknots);
		localStorage.setItem("speedGPS", speedknots);
		localStorage.setItem("altitudeGPS", position.coords.altitude);
		tizen.systeminfo.getPropertyValue("WIFI_NETWORK", onSuccessCallback, onErrorCallback);
	}

	function errorCallback(error) 
	{
		var errorInfo = document.getElementById("locationInfo");

		switch (error.code) 
		{
		case error.PERMISSION_DENIED:         
			errorInfo.innerHTML = "User denied the request for Geolocation.";
			break;
		case error.POSITION_UNAVAILABLE:
			errorInfo.innerHTML = "Location information is unavailable.";
			break;
		case error.TIMEOUT:
			errorInfo.innerHTML = "The request to get user location timed out.";
			break;
		case error.UNKNOWN_ERROR:
			errorInfo.innerHTML = "An unknown error occurred.";
			break;
		}
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





})();