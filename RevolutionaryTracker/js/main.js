
(function(){

//	Variable Declarations
	var page=document.getElementById("main");
	var resultDiv=document.getElementById("GPS"),
	popup = page.querySelector("#moreoptionsPopup"),
	popupCircle = page.querySelector("#moreoptionsPopupCircle"),	
	elSelector = page.querySelector("#selector"),
	selector,
	clickHandlerBound;
	var value=0;
	var timer;
	var timerValue;
	var timer2;
	var gServiceAppId = 'R70X8j9Ivq.service_new1';
	var	checkcodeid,
	url,
	timeinSeconds,
	command;
	var serviceURL;
	var totalStepsFortoday;
	var totalStepsFortoday1;
	var counterPedo1=0;
	var timerHRM1;
	var watchId;


	var battery = navigator.battery || navigator.mozBattery || navigator.webkitBattery;
	var SERVICE_APP_ID = 'R70X8j9Ivq.service_new1',
	SERVICE_PORT_NAME = 'SAMPLE_PORT',
	LOCAL_MESSAGE_PORT_NAME = 'SAMPLE_PORT_REPLY',
	localMessagePort = null,
	remoteMessagePort = null,
	localMessagePortWatchId = null,
	isStarting = false,
	launchServiceApp = null;



	var db,
	database="RTdb",
	object_Store="pedo",
	object_Store2="rtcts";


//	Calling Methode after 5 minutes
	function tick() {
		localStorage.setItem("battery", Math.floor(navigator.battery || navigator.mozBattery || navigator.webkitBattery.level * 100));
		console.log(++value);
		getXML();                 //Call the Method for repeatition
	}

	function startThecall() {
		setPingrateValue();
		var timerValue1=localStorage.getItem("timerValue1");
		var timerValue2=localStorage.getItem("timerValue2");
		timerValue=(timerValue2==undefined||timerValue2=="null")?timerValue1:timerValue2;
		if(timerValue==undefined || timerValue=="null"){
			stopThecall();
		}else{
			tick();
			timer = setTimeout(startThecall, timerValue);
		}

	}

	function stopThecall() {
		clearTimeout(timer);
	}


	//For HRM in one hour
	function tickHRM() {
		console.log(++value);
		window.webapis.motion.start("HRM", HRMonchangedCB);
	}

	function startThecallHRM() {
		var HRMValue1=localStorage.getItem("HRMValue1");
		var HRMValue2=localStorage.getItem("HRMValue2");
		timerValue=(HRMValue2==undefined ||HRMValue2=="null")?HRMValue1:HRMValue2;
		tickHRM();
		timerHRM1 = setTimeout(startThecallHRM, timerValue);
	}

	function stopThecallHRM() {
		clearTimeout(timerHRM1);
	}
//	Ends Calling Methode after 5 minutes



//	Get all data before responding back to server
	function getAllData(){
		oneShotFunc();
		tizen.systeminfo.getPropertyValue("WIFI_NETWORK", onSuccessCallback, onErrorCallback);
		tizen.systeminfo.getPropertyValue("CELLULAR_NETWORK", getLocn,getError);
		localStorage.setItem("battery", Math.floor(navigator.battery || navigator.mozBattery || navigator.webkitBattery.level * 100));
	}

//	To set frequency rate to UI
	function setPingrateValue(){
		var pingrate=(localStorage.getItem("timerValue2")==undefined||localStorage.getItem("timerValue2")=="null")?(localStorage.getItem("timerValue1")==undefined||localStorage.getItem("timerValue1")=="null")?"OFF":localStorage.getItem("timerValue1"):localStorage.getItem("timerValue2");
		if(pingrate=="OFF"||pingrate=="0"){
			document.getElementById("pingrateval").innerHTML="0";
			document.getElementById("pingratetext").innerHTML="OFF";	
		}else{
			pingrate=pingrate/1000;
			if(pingrate>=60){
				pingrate=pingrate/60;
				pingrate=pingrate;
				document.getElementById("pingrateval").innerHTML=pingrate;
				document.getElementById("pingratetext").innerHTML="Minutes";
			}else{
				pingrate=pingrate;
				document.getElementById("pingrateval").innerHTML=pingrate;
				document.getElementById("pingratetext").innerHTML="Seconds";
			}
		}
	}


//	create Db and open it
	function createDB(){
		// Checking support of indexedDb
		window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
		if (!window.indexedDB) {
			console.log("Your browser doesn't support a stable version of IndexedDB.")
		}

		// Opening a new database connection with
		var request = window.indexedDB.open(database, 1);
		request.onerror = function(event) {
			console.log("error: ");
		};

		request.onsuccess = function(event) {
			db = request.result;
			console.log("success: "+ db);
			getSteps();
		};

		// Fired if database not available
		request.onupgradeneeded = function(event) {
			var db = event.target.result;
			var objectStore = db.createObjectStore(object_Store, {keyPath: "Id",autoIncrement:true});
			objectStore.createIndex("firstStep","firstStep",{unique:false});
			objectStore.createIndex("totalsteps","totalsteps",{unique:false});
			objectStore.createIndex("Pedosteps","Pedosteps",{unique:false});
			objectStore.createIndex("Id","Id",{unique:true});

			var objectStore2 = db.createObjectStore(object_Store2, {keyPath: "Id",autoIncrement:true});
			objectStore2.createIndex("fname","fname",{unique:false});
			objectStore2.createIndex("lname","lname",{unique:false});
			objectStore2.createIndex("number","number",{unique:false});
			objectStore2.createIndex("Id","Id",{unique:true});

			var data2={ firstStep: "0", totalsteps: "0" ,Pedosteps:"0"};
			updatePriority(data2);
			var ctsdata={fname:"Michael",lname:"Musial",number:"+18477210660"};	
			updatePriority(ctsdata,"cts");
		}
	}



//	Set the value of First step count 
	function setFirstStep(stepCount){
		var request = window.indexedDB.open(database, 1);
		request.onerror = function(event) {
			console.log("error: ");
		};

		request.onsuccess = function(event) {
			db = request.result;
			var transaction = db.transaction(object_Store,"readwrite");
			var objectStore = transaction.objectStore(object_Store);

			var request1 = objectStore.get(1);
			request1.onsuccess = function(evt) {  
				var data=request1.result;
				//alert(data.Id);
				if(parseInt(data.firstStep)<1){
					data.firstStep=stepCount;
					data.totalsteps=stepCount;
					data.Pedosteps=data.totalsteps-data.firstStep;
					localStorage.setItem("pedoSteps",data.Pedosteps);
					updatePriority(data);
				}
			}
		};

	}


//	Set the value of total step count
	function setPedoStepsMid(){
		var request00 = window.indexedDB.open(database, 1);
		request00.onerror = function(event) {
			console.log("error: ");
		};
		request00.onsuccess = function(event) {
			db = request00.result;
			var transaction9 = db.transaction(object_Store,"readwrite");
			var objectStore9 = transaction9.objectStore(object_Store);
			var request9 = objectStore9.get(1);
			request9.onsuccess = function(evt) {  
				var data=request9.result;
				data.firstStep=data.totalsteps;
				data.totalsteps=data.totalsteps;
				data.Pedosteps=data.totalsteps-data.firstStep;
				localStorage.setItem("pedoSteps",data.Pedosteps);
				updatePriority(data);
			}
		};
	}


//	Set the value of total step count
	function setTotalStep(pedoSteps){
		// Opening a new database connection with
		var request = window.indexedDB.open(database, 1);
		request.onerror = function(event) {
			console.log("error: ");
		};

		request.onsuccess = function(event) {
			db = request.result;
			var transaction = db.transaction(object_Store,"readwrite");
			var objectStore = transaction.objectStore(object_Store);
			var transaction = db.transaction(object_Store,"readwrite");
			var objectStore = transaction.objectStore(object_Store);
			var request1 = objectStore.get(1);
			request1.onsuccess = function(evt) {  
				var data=request1.result;
				if(parseInt(data.firstStep)<1){
					data.firstStep=data.firstStep;
				}
				data.totalsteps=pedoSteps;
				data.Pedosteps=data.totalsteps-data.firstStep;
				localStorage.setItem("pedoSteps",data.Pedosteps);
				updatePriority(data);
			}
		};

	}

//	GET steps from db
	function getSteps(){
		var request22 = window.indexedDB.open(database, 1);
		request22.onerror = function(event) {
			console.log("error: ");
		};

		request22.onsuccess = function(event) {
			var transaction112 = db.transaction(object_Store,"readwrite");
			var objectStore112 = transaction112.objectStore(object_Store);

			var request112 = objectStore112.get(1);
			request112.onsuccess = function(evt) {  
				var data=request112.result;
				if(data!=undefined){
					localStorage.setItem("pedoSteps",data.Pedosteps==undefined?0:data.Pedosteps);
				}
			};
		};
	}

//	GET steps from db
	function getcts(){
		var request221 = window.indexedDB.open(database, 1);
		request221.onerror = function(event) {
			console.log("error: ");
		};

		request221.onsuccess = function(event) {
			var transaction122 = db.transaction(object_Store2,"readwrite");
			var objectStore122 = transaction122.objectStore(object_Store2);
			var resultBuffer=[];
			var request122 = objectStore122.openCursor();
			request122.onsuccess = function(evt) {  
				var cursor = evt.target.result;  
				if (cursor) { 
					//console.log(cursor);
					var data=cursor.value;
					resultBuffer.push(data);
					cursor.continue();  
				}  
				else {  
					//console.log("No more entries!");  
					localStorage.setItem("ctslist",JSON.stringify(resultBuffer));
				}  
			};
		};
	}



	//	Delete a contact
	function deleteSimple(Id){
		var request11 = indexedDB.open(database);
		request11.onsuccess = function(e)
		{
			var idb = e.target.result;
			var transaction8 = db.transaction(object_Store2,"readwrite");
			var objectStore8= transaction8.objectStore(object_Store2);
			var request8 = objectStore8.delete(parseInt(Id));

			request8.onsuccess = function(ev)
			{
				console.log(ev);
				getXMLOther(localStorage.IMEI,"Contact","ConatctDeleteSucceded");  //For other changes requests
				getcts();

			};

			request8.onerror = function(ev)
			{
				console.log('Error occured', ev.srcElement.error.message);
				getXMLnak(localStorage.IMEI,"Contact","ConatctDeleteFailed");
			};
		};
	}




//	GET steps from db
	function managects(ctsData){
		var transaction12 = db.transaction(object_Store2,"readwrite");
		var objectStore12 = transaction12.objectStore(object_Store2);

		var request12 = objectStore12.get(parseInt(ctsData.srno));
		request12.onsuccess = function(evt) {  
			var data=request12.result;
			if(data==undefined){
				if(parseInt(ctsData.srno)<5){
					var data={};
					data.fname=ctsData.fname;
					data.lname=ctsData.lname;
					data.number=ctsData.number;
					updatePriority(data,"cts");
				}else{
					return true;
				}
			}else{
				if(data.fname.toLowerCase()==ctsData.fname.toLowerCase()&&data.lname.toLowerCase()==ctsData.lname.toLowerCase() && data.number.toLowerCase()==ctsData.number.toLowerCase()){
					getSteps();                        //get steps data
					getcts();                          //get cts data
				}else{
					data.fname=ctsData.fname;
					data.lname=ctsData.lname;
					data.number=ctsData.number;
					updatePriority(data,"cts");
				}
			}
		}
	}




	//Save and Update steps count
	function  updatePriority(data2,check){
		var EditData=data2;
		var request = window.indexedDB.open(database, 1);
		request.onerror = function(event) {
			console.log("error: ");
		};

		request.onsuccess = function(event) {
			if(check=="cts"){
				db = request.result;
				console.log("success: "+ db);
				var transaction = db.transaction(object_Store2,"readwrite");
				var objectStore1 = transaction.objectStore(object_Store2);
				var result=objectStore1.put(EditData);
				result.onsuccess = function(event) {
					getSteps();                        //get steps data
					getcts();                          //get cts data
				}
				result.onerror = function(event) {
					console.log("error: ");
				};
			}else{
				db = request.result;
				console.log("success: "+ db);
				var transaction = db.transaction(object_Store,"readwrite");
				var objectStore1 = transaction.objectStore(object_Store);
				var result=objectStore1.put(EditData);
				result.onsuccess = function(event) {
					getSteps();                        //get steps data
				}
				result.onerror = function(event) {
					console.log("error: ");
				};
			}
		};

	}



//	Setting Alarm for next day
	function setAlarm2(){
		tizen.alarm.removeAll();                           //Removing all Alarms
		var date = new Date(new Date().getFullYear(),new Date().getMonth(), new Date().getDate(), 23, 59,59);
		var alarm1 = new tizen.AlarmAbsolute(date);
		var appControl = new window.tizen.ApplicationControl("http://tizen.org/appcontrol/operation/viewAlarm");
		window.tizen.alarm.add(alarm1, tizen.application.getCurrentApplication().appInfo.id, appControl);
		console.log("Alarm added with id: " + alarm1.id);
		console.log("The alarm will trigger at " + alarm1.getNextScheduledDate());
	}

//	Setting Alarm for today 12am
	
	 function setAlarm2(){
		  tizen.alarm.removeAll();                           //Removing all Alarms
		  var date = new Date(new Date().getFullYear(),new Date().getMonth(), new Date().getDate(), 23, 59,59);
		  var alarm1 = new tizen.AlarmAbsolute(date);
		  var appControl = new window.tizen.ApplicationControl("http://tizen.org/appcontrol/operation/viewAlarm");
		  window.tizen.alarm.add(alarm1, tizen.application.getCurrentApplication().appInfo.id, appControl);
		  
		  var date2 = new Date(new Date().getFullYear(),new Date().getMonth(), new Date().getDate(),23, 59,59);
		  date2.setDate(new Date().getDate()+1);
		  var alarm12 = new tizen.AlarmAbsolute(date2);
		  var appControl2 = new window.tizen.ApplicationControl("http://tizen.org/appcontrol/operation/viewAlarm");
		  window.tizen.alarm.add(alarm12, tizen.application.getCurrentApplication().appInfo.id, appControl2);
		 }
		// Setting Alarm for today 12am
		 function setAlarm(){
		  tizen.alarm.removeAll();                         //Removing all Alarms
		  var date = new Date(new Date().getFullYear(),new Date().getMonth(), new Date().getDate(), 23, 59,59);
		  var alarm1 = new tizen.AlarmAbsolute(date) ;
		  var appControl = new window.tizen.ApplicationControl("http://tizen.org/appcontrol/operation/viewAlarm");
		  window.tizen.alarm.add(alarm1, tizen.application.getCurrentApplication().appInfo.id, appControl);
		  
		  var date2 = new Date(new Date().getFullYear(),new Date().getMonth(), new Date().getDate(),23, 59,59);
		  date2.setDate(new Date().getDate()+1);
		  var appControl2 = new window.tizen.ApplicationControl("http://tizen.org/appcontrol/operation/viewAlarm");
		  window.tizen.alarm.add(alarm12, tizen.application.getCurrentApplication().appInfo.id, appControl2);
		 }


//	Window Onload
	window.onload = function(){
		start();                                                   //Starting Message port
		createDB();                                                //Creating DB
		if(localStorage.getItem("stopItAll")==undefined ||localStorage.getItem("stopItAll")=="null"){
			localStorage.setItem("timerValue1", "300000");             //Ping frequency rate fixed to 5 minutes
		}else if(localStorage.getItem("stopItAll")==="yes"){
			localStorage.removeItem("timerValue1"); 
			localStorage.removeItem("timerValue2"); 
			stopThecall();
		}
		localStorage.setItem("HRMValue1","3600000");               //Set Timer frequency rate to get HRM in one hours      //Set Timer frequency rate to get HRM

		//to get appControl and get message info
		var reqAppControl = tizen.application.getCurrentApplication().getRequestedAppControl();
		if (reqAppControl) {
			var appControl = reqAppControl.appControl;
			var panic=1;
			if(appControl.operation=="http://tizen.org/appcontrol/operation/opencall")
			{
				var reqData = reqAppControl.appControl.data;
				var ctslist2=localStorage.ctslist;

				if(ctslist2==undefined||ctslist2=="null"||ctslist2=="[]"){
					tizen.application.getCurrentApplication().hide();
				}else{
					tau.changePage("contents/list_swipelist.html");
				}

			}else if(appControl.operation=="http://tizen.org/appcontrol/operation/sosRequest"){
				localStorage.setItem("alertText", "SOS request sent!");                //Alert Stuff
				tau.changePage("contents/alert.html");

				var ctslist1=localStorage.ctslist;
				if(ctslist1==undefined||ctslist1=="null"||ctslist1=="[]"){
					localStorage.setItem("alertText", "No Contact available to call!");                //Alert Stuff
					tau.changePage("contents/alert.html");
					getXML(panic);
					window.webapis.motion.stop("HRM");
					tizen.application.getCurrentApplication().hide(); 
				}else{
					ctslist1=JSON.parse(ctslist1);
					var number1=ctslist1[0].number;
					var number="tel:"+number1;
					var appControl = new tizen.ApplicationControl("http://tizen.org/appcontrol/operation/call",
							number, null, null, null, null);

					tizen.application.launchAppControl(appControl, null,
							function() {console.log("launch application control succeed");
							getXML(panic);
							window.webapis.motion.stop("HRM");
							//tizen.humanactivitymonitor.setAccumulativePedometerListener(onchangedCBpedo);
							tizen.application.getCurrentApplication().hide();		
					},
					function(e) {console.log("launch application control failed. reason: " + e.message);
					getXML(panic);
					window.webapis.motion.stop("HRM");
					//tizen.humanactivitymonitor.setAccumulativePedometerListener(onchangedCBpedo);
					tizen.application.getCurrentApplication().hide(); 	},
					null);
				}

				var reqData = reqAppControl.appControl.data;
				if(reqAppControl.callerAppId=="zJ3btqNZNK.RTWatch"){
					try
					{
						var data = new tizen.ApplicationControlData("current-time", [new Date().toString()]);
						reqAppControl.replyResult([data]);
					}catch(e){
						console.log("Error in replying back!");
					}
				}

			}else if(appControl.operation=="http://tizen.org/appcontrol/operation/healthRequest"){
				window.webapis.motion.stop("HRM");
				var reqData = reqAppControl.appControl.data;
				if(reqAppControl.callerAppId=="zJ3btqNZNK.RTWatch"){
					try
					{
						var steps=localStorage.pedoSteps;
						var hrm=localStorage.HRM;
						var data = new tizen.ApplicationControlData("Data", [new Date().toString(),steps,hrm]);
						reqAppControl.replyResult([data]);
					}catch(e){
						console.log("Error in replying back!");
					}
					tizen.application.getCurrentApplication().hide();
				}
			}else if(appControl.operation=="http://tizen.org/appcontrol/operation/viewAlarm"){
				setPedoStepsMid();                  //Setting PedoSteps for 12am
				setAlarm();                         //Setting Alarm for next day 12am
				tizen.application.getCurrentApplication().hide(); 
			}else{
				setAlarm2();	
			}
		}
		startThecall();                           //Server request after every 5 minutes
		startThecallHRM();                        //Get HRM after every 1 hour
		tizen.humanactivitymonitor.setAccumulativePedometerListener(onchangedCBpedo);
	};



//	Page BeforeShow
	page.addEventListener("pagebeforeshow", function() {
		//start();                                                   //Starting Message port
		oneShotFunc();
		watchFunc();                                        //watching GPS 
		localStorage.setItem("serviceURL1", "http://queue.revolutionarytracker.com/location.svc/queuemessage");
		var radius = window.innerHeight / 2 * 0.8;
		if (tau.support.shape.circle) {
			selector = tau.widget.Selector(elSelector, {itemRadius: radius});
		}

		console.log(localStorage.ctslist);
		console.log(JSON.parse(localStorage.ctslist));
		//Checking running service status
		//startService();              //method to check service either its running or not

		//Battery Stuff
		//	window.addEventListener('load', getBatteryState);
		/* Detects changes in the battery charging status */
		//	battery.addEventListener('chargingchange', getBatteryState);
		/* Detects changes in the battery charging time */
		//	battery.addEventListener('chargingtimechange', getBatteryState);
		/* Detects changes in the battery discharging time */
		//battery.addEventListener('dischargingtimechange', getBatteryState);
		/* Detects changes in the battery level */
		battery.addEventListener('levelchange', getBatteryState);



		//Calling all functionalities
		console.log("gh"+(navigator.battery || navigator.mozBattery || navigator.webkitBattery).level);
		tizen.systeminfo.getPropertyValue("CELLULAR_NETWORK", getLocn,getError);
		tizen.systeminfo.getPropertyValue("WIFI_NETWORK", onSuccessCallback, onErrorCallback);
		tizen.humanactivitymonitor.setAccumulativePedometerListener(onchangedCBpedo);
		tizen.humanactivitymonitor.setAccumulativePedometerListener(onchangedCB);
	});


//	Page show EventpedoDistance
	page.addEventListener("pageshow", function() {
		tau.openPopup(popupCircle);
		setTimeout(function(){
			console.log(Math.floor(navigator.battery || navigator.mozBattery || navigator.webkitBattery.level * 100) + '%');
			localStorage.setItem("battery", Math.floor(navigator.battery || navigator.mozBattery || navigator.webkitBattery.level * 100));
			setPingrateValue();
		},1000);
		setInterval(function(){
			localStorage.setItem("battery", Math.floor(navigator.battery || navigator.mozBattery || navigator.webkitBattery.level * 100)); 
		}, 3000);
	});

//	Page BeforeHide
	page.addEventListener("pagebeforehide", function(event) {
		window.webapis.motion.stop("HRM");            //Stoping HRM motion sensor
		stopWatchFunc();                              //Stopping watch function(GPS)
	}, false);


//	Battery State CallBack
	function getBatteryState() 
	{
		var message = "";
		var panic=0;
		var charging = battery.charging;
		var chargingTime = getTimeFormat(battery.chargingTime);
		var dischargingTime = getTimeFormat(battery.dischargingTime);
		var level = Math.floor(battery.level * 100);
		if (charging == false){ 
			if(level<16){
				message = "Battery Low";
				getXML(panic,"battery low");  
				getXML(panic,"off charger");                            //Sending request to server
			}else{
				/* Not charging */
				message = dischargingTime.hour + ":" + dischargingTime.minute + " remained.";
				if (battery.dischargingTime == "Infinity") 
				{
					message = "";
				}
				getXML(panic,"off charger");                           //Sending request to server
			}


		}
		else if (charging==true) {  
			if (level == 100) 
			{
				message = "Charging is completed";
				getXML(panic,"fully charged");                         //Sending request to server
			} else if(level <15){
				/* Charging */
				message = "Charging is complete after " + chargingTime.hour + ":" + chargingTime.minute;
				if (battery.chargingTime === "Infinity") 
				{
					message = "";
				}
				getXML(panic,"on charger");
				getXML(panic,"battery low");                           //Sending request to server
			}else{
				message = "Charging is complete after " + chargingTime.hour + ":" + chargingTime.minute;
				if (battery.chargingTime === "Infinity") 
				{
					message = "";
				}
				getXML(panic,"on charger");
			}

		}


		/*console.log( charging ? 'charging..' : 'Please connect the charger.');
		console.log( level + "%");
		console.log(level);
		console.log(message);*/
	}

	/* Time is received in seconds, converted to hours and minutes, and returned */
	function getTimeFormat(time) 
	{
		/* Time parameter is second */
		var tempMinute = time / 60;

		var hour = parseInt(tempMinute / 60, 10);
		var minute = parseInt(tempMinute % 60, 10);
		minute = minute < 10 ? "0" + minute : minute;

		return {"hour": hour, "minute": minute};
	}


	//HRM success Callback
	function HRMonchangedCB(hrmInfo)
	{
		console.log(hrmInfo.heartRate);
		//mainHRMDiv.style.display="";
		if(hrmInfo.heartRate==-3){
			window.webapis.motion.stop("HRM");
		}
		if(hrmInfo.heartRate > 0) {
			localStorage.setItem("HRM", JSON.stringify(hrmInfo.heartRate));
			window.webapis.motion.stop("HRM");
		}
	}



	//Onchange for Accumulative Pedo
	function onchangedCB(pedometerInfo) {
		console.log(pedometerInfo);
		console.log(pedometerInfo.stepCountDifferences[0].stepCountDifference);
		console.log(pedometerInfo.stepCountDifferences[0].timestamp);
		console.log("Step status : " + pedometerInfo.stepStatus);
		console.log("Accumulative total step count : " + pedometerInfo.accumulativeTotalStepCount);
		//localStorage.setItem("pedoSteps", JSON.stringify(totalStepsFortoday1));
		localStorage.setItem("pedoDistance", JSON.stringify(pedometerInfo.accumulativeDistance));
		localStorage.setItem("pedocalories", JSON.stringify(pedometerInfo.accumulativeCalorie));
		setTotalStep(pedometerInfo.accumulativeTotalStepCount);
	}

	//Pedo listener initial
	function onchangedCBpedo(pedometerInfo){

		//alert("test");
		console.log("Step status : " + pedometerInfo.stepStatus);
		console.log("Speed : " + pedometerInfo.speed);
		console.log("Walking frequency : " + pedometerInfo.walkingFrequency);
		console.log("Accumulative total step count : " + pedometerInfo.accumulativeTotalStepCount);
		setFirstStep(pedometerInfo.accumulativeTotalStepCount);
		/* Unregisters a previously registered listener */
		tizen.humanactivitymonitor.unsetAccumulativePedometerListener();
		/* Registers a previously registered listener */
		console.log("Registering new listener!");
		tizen.humanactivitymonitor.setAccumulativePedometerListener(onchangedCB);
	}



//	Click event for moreoptions
	elSelector.addEventListener("click", function(event) {
		var target = event.target;
		if(target.id=="call")
		{
			if(localStorage.ctslist==undefined||localStorage.ctslist=="null"||localStorage.ctslist=="[]"){
				localStorage.setItem("alertText", "No Contacts available!");                //Alert Stuff
				tau.changePage("contents/alert.html");
			}else{
				tau.changePage("contents/list_swipelist.html");
			}
		}
		else if(target.id=="setting")
		{
			console.log("settings");
			tau.changePage("contents/settings.html");
		}
		else if(target.id=="sos")
		{
			var panic=1;
			console.log("sos");
			getSteps();                       //getting Steps from DB
			localStorage.setItem("alertText", "Panic request sent!"); 
			tau.changePage("contents/alert.html");//Alert Stuff
			getXML(panic);
		}else if(target.id=="stop")
		{
			stopThecall();
			stopWatchFunc();                            //Stop the GPS Watch request
			sendCommand('connect');
			console.log("Stoping the requests!");
			//var data={srno:"4",fname:"Carry",lname:"M",number:"+919625713066"};
			//managects(data);
			//setTotalStep();
		}else if(target.id=="pingrate1"||target.id=="pingrateval"||target.id=="pingratetext"){
			//var data={srno:"3",fname:"Ahh",lname:"M",number:"+919625713066"};
			//managects(data);
			var pingrate=(localStorage.getItem("timerValue2")==undefined||localStorage.getItem("timerValue2")=="null")?(localStorage.getItem("timerValue1")==undefined||localStorage.getItem("timerValue1")=="null")?"OFF":localStorage.getItem("timerValue1"):localStorage.getItem("timerValue2");
			if(pingrate=="OFF"||pingrate=="0"){
				localStorage.setItem("alertText", "PingRate is OFF!");                //Alert Stuff
				tau.changePage("contents/alert.html");
			}else{
				pingrate=pingrate/1000;
				if(pingrate>=60){
					pingrate=pingrate/60;
					pingrate=pingrate;
					localStorage.setItem("alertText", "PingRate is\n"+pingrate+" Minutes");                //Alert Stuff
					tau.changePage("contents/alert.html");
				}else{
					pingrate=pingrate;
					localStorage.setItem("alertText", "PingRate is\n"+pingrate+" Seconds");                //Alert Stuff
					tau.changePage("contents/alert.html");
				}
			}
		}

		if (tau.support.shape.circle) {
			if (target.classList.contains("ui-selector-indicator")) {
				if(target.innerText=="Call")
				{
					if(localStorage.ctslist==undefined||localStorage.ctslist=="null"||localStorage.ctslist=="[]"){
						localStorage.setItem("alertText", "No Contacts available!");                //Alert Stuff
						tau.changePage("contents/alert.html");
					}else{
						tau.changePage("contents/list_swipelist.html");
					}
				}else if(target.innerText=="Settings")
				{
					console.log("settings");
					tau.changePage("contents/settings.html");
				}else if(target.innerText=="SOS")
				{
					var panic=1;
					console.log("sos");
					localStorage.setItem("alertText", "Panic request sent!");                //Alert Stuff
					tau.changePage("contents/alert.html");
					getXML(panic);
				}else if(target.innerText=="Stop")
				{
					stopThecall();
					stopWatchFunc();                    //Stop the GPS Watch request
					console.log("Stoping the requests!");
					sendCommand('connect');
					//var data={srno:"2",fname:"ravi",lname:"kumar",number:"+919625713066"}
					//managects(data);
				}else if(target.innerText=="PingRate"){
					//var data={srno:"2",fname:"Lol",lname:"M",number:"+919625713066"};
					//managects(data);
					var pingrate=(localStorage.getItem("timerValue2")==undefined||localStorage.getItem("timerValue2")=="null")?(localStorage.getItem("timerValue1")==undefined||localStorage.getItem("timerValue1")=="null")?"OFF":localStorage.getItem("timerValue1"):localStorage.getItem("timerValue2");
					if(pingrate=="OFF"||pingrate=="0"){
						localStorage.setItem("alertText", "PingRate is OFF!");                //Alert Stuff
						tau.changePage("contents/alert.html");
					}else{
						pingrate=pingrate/1000;
						if(pingrate>=60){
							pingrate=pingrate/60;
							pingrate=pingrate;
							localStorage.setItem("alertText", "PingRate is\n"+pingrate+" Minutes");                //Alert Stuff
							tau.changePage("contents/alert.html");
						}else{
							pingrate=pingrate;
							localStorage.setItem("PingRate is\n"+pingrate+" Seconds");                //Alert Stuff
							tau.changePage("contents/alert.html");
						}
					}
				}
			}
		}
	});



//	Get Cellular Info CallBacks(Success)
	function getLocn(cellular) {
		localStorage.setItem("cellId", cellular.cellId+"-"+cellular.mcc +"-"+ cellular.mnc+"-"+ cellular.lac+"----Gsm");
		console.log(cellular.cellId+"-"+cellular.mcc +"-"+ cellular.mnc+"-"+ cellular.lac);   // i am getting all these values 
		console.log("mimi"+cellular.imei); //this is not working
		localStorage.setItem("IMEI", cellular.imei);
	}

//	Get Cellular Info CallBacks(Error)
	function getError(error){
		console.log("Not supported: " + error.message);
		console.log("Not supported: " + error.message);
	}



//	Generate XML data
	function getXML(panicvalue,id){
		var date = new Date();
		//var n = d.getTime();
		var offset = -(date.getTimezoneOffset()/60)*4; 
		var formattedDate = date.getFullYear().toString().substr(2,2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' +   ('0' + date.getDate()).slice(-2)+ ',' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2)+ ':' +('0' + date.getSeconds()).slice(-2)+offset;
		console.log(formattedDate);
		var lat=(localStorage.latitude===undefined||localStorage.latitude==="null")?0:localStorage.latitude,
				long=(localStorage.longitude===undefined||localStorage.longitude==="null")?0:localStorage.longitude,
						alt=(localStorage.pedoSteps===undefined||localStorage.pedoSteps==="null")?0:localStorage.pedoSteps,
								speed=(localStorage.speedGPS===undefined||localStorage.speedGPS==="null")?0:localStorage.speedGPS,
										accuracyGPS=(localStorage.accuracyGPS===undefined||localStorage.accuracyGPS==="null")?0:localStorage.accuracyGPS,
												altitudeGPS=(localStorage.altitudeGPS===undefined||localStorage.altitudeGPS==="null")?0:localStorage.altitudeGPS,
														battery=(localStorage.battery===undefined||localStorage.battery==="null")?0:localStorage.battery,
																signalstrength=(localStorage.wifiStrength===undefined||localStorage.wifiStrength==="null")?0:localStorage.wifiStrength,
																		panic=(panicvalue==undefined||panicvalue=="null")?0:panicvalue,
																				hrm=(localStorage.HRM===undefined||localStorage.HRM==="null")?0:localStorage.HRM;
		var myAwesomeObject = {
				event : {
					dev :localStorage.IMEI ,
					id:(id==undefined)?'location':id,
							location:{
								time:formattedDate,
								latitude:lat,
								longitude:long,
								steps:alt,
								speed:speed,
								acc:accuracyGPS,
								altitude:altitudeGPS,
								battery:battery,
								signal:Math.floor(signalstrength * 100),
								tamper:panic,
								hr:hrm
							} 
				}
		};
		//console.log(myAwesomeObject);
		/*if(myAwesomeObject.event.location.latitude==0 || myAwesomeObject.event.location.latitude==undefined){
		myAwesomeObject=JSON.parse(localStorage.previousSendData);
	}else{
		localStorage.setItem("previousSendData", JSON.stringify(myAwesomeObject));
	}*/
		localStorage.setItem("previousSendData", JSON.stringify(myAwesomeObject));
		var xmlString = objectToXml(myAwesomeObject);
		var xmlForm=jQuery.parseXML(xmlString);
		console.log(xmlForm);
		sendXML(xmlString);
	}

//	For other responses normal one
	function getXMLOther(imei,cmdID,str){
		var jsonObj={
				ack:{
					dev:imei,
					id:cmdID,
					msg:str
				}
		}

		var xmlForm=objectToXml(jsonObj);
		sendXML(xmlForm);
	}



	//For other responses normal one
	function getXMLnak(imei,cmdID,message){
		var jsonObj={
				nak:{
					dev:imei,
					id:cmdID,
					msg:message
				}
		}

		var xmlForm=objectToXml(jsonObj);
		sendXML(xmlForm);
	}

//	Creating XML from JSON
	function objectToXml(obj) {
		var xml = '';

		for (var prop in obj) {
			if (!obj.hasOwnProperty(prop)) {
				continue;
			}

			if (obj[prop] == undefined)
				continue;

			xml += "<" + prop + ">";
			if (typeof obj[prop] == "object")
				xml += objectToXml(new Object(obj[prop]));
			else
				xml += obj[prop];

			xml += "</" + prop + ">";
		}

		return xml;
	}


//	Function to Send XML data to server
	function sendXML(xml){
		var serviceURL1=localStorage.getItem("serviceURL1");
		var serviceURL2=localStorage.getItem("serviceURL2");
		var serviceURL=(serviceURL2==undefined)?serviceURL1:serviceURL2;
		console.log(serviceURL);
		try{
			$.ajax({
				type: "POST",
				url: serviceURL,
				dataType: "xml",
				contentType: "application/xml",
				data: xml,
				processData: false,
				success: function (res) {
					console.log(res);
					console.log("XML: it works!");
				},
				error: function (sdf,sdfs) {
					debugger;
					console.log(sdf,sdfs);
					console.log("XML: not working! ");
				}
			});
		}catch(e){
			console.log("Not able to reach to server!");
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





//	Wifi signal Strength onSuccess
	function onSuccessCallback(wifi) {
		console.log("Status: " + wifi.status +  "    SSID: " + wifi.ssid
				+ "\nIP Address: " + wifi.ipAddress + "\nIPV6 Address: " + wifi.ipv6Address + "    Signal Strength: " + wifi.signalStrength);

		localStorage.setItem("wifiStrength", JSON.stringify(wifi.signalStrength));

		console.log("Status: " + wifi.status +  "    SSID: " + wifi.ssid
				+ "\nIP Address: " + wifi.ipAddress + "\nIPV6 Address: " + wifi.ipv6Address + "    Signal Strength: " + wifi.signalStrength);

	}

//	WIFI error callback
	function onErrorCallback(error) {
		console.log("Not supported: " + error.message);
	}



	//oneShot GPS
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

	//Watch on GPS location change
	function watchFunc() 
	{
		if (navigator.geolocation) 
		{
			if(watchId){
				navigator.geolocation.clearWatch(watchId);
			}
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
			if(watchId){
				navigator.geolocation.clearWatch(watchId);
			}

		} 
		else 
		{
			console.log( "Geolocation is not supported.");
		}
	}

//	GPS callbacks
	function successCallback(position) 
	{
		var crd = position.coords;
		localStorage.setItem("latitude", JSON.stringify(crd.latitude));
		localStorage.setItem("longitude", JSON.stringify(crd.longitude));
		localStorage.setItem("accuracy", JSON.stringify(crd.accuracy));
		localStorage.setItem("LastGPSdate", new Date());
		var speed=crd.speed;
		speed=convert.speed(speed).ms().to.knots();    //Converting speed m/s to knotsf
		speed=Math.round(speed);
		localStorage.setItem("speedGPS", speed);
		localStorage.setItem("accuracyGPS", crd.accuracy);
		localStorage.setItem("altitudeGPS", crd.altitude);


	}

	function errorCallback(error) 
	{
		//var errorInfo = document.getElementById("locationInfo");

		switch (error.code) 
		{
		case error.PERMISSION_DENIED:         
			console.log( "User denied the request for Geolocation.");
			break;
		case error.POSITION_UNAVAILABLE:
			console.log("Location information is unavailable.");
			break;
		case error.TIMEOUT:
			console.log("The request to get user location timed out.");
			break;
		case error.UNKNOWN_ERROR:
			console.log( "An unknown error occurred.");
			break;
		}
	}



	/**
	 * Sends message to another application.
	 *
	 * @param {string} command
	 */
	function sendCommand(command) {
		try {
			remoteMessagePort.sendMessage([{
				key: 'command',
				value: command
			}],
			localMessagePort);
			console.log('Sending: ' + command);
		} catch (error) {
			console.error(error);
			start();                                                   //Starting Message port
		}
	}

	/**
	 * Performs action after receiving message from another application.
	 *
	 * @param {MessagePortDataItem[]} data
	 */
	function onReceive(data) {
		getAllData();       
		var message = null;
		var panic=0;
		i = 0,
		len = data.length;
		
		for (i = 0; i < len; i += 1) {
			if (data[i].key === 'server') {
				message = data[i].value;
			}
		}
		
		console.log('Received : ' + message);
		var ctsData=message.split(",");
		if (message === 'googleMap') {
			var lat=localStorage.latitude;
			var long=localStorage.longitude;
			var gpsDate=(localStorage.LastGPSdate==undefined || localStorage.LastGPSdate=="undefined" || localStorage.LastGPSdate=="null")?new Date():localStorage.LastGPSdate
					var date = new Date(gpsDate);        //Getting GPS date
			var offset = -(date.getTimezoneOffset()/60)*4; 
			var steps=(localStorage.pedoSteps===undefined||localStorage.pedoSteps==="null")?0:localStorage.pedoSteps;
			var battery=(localStorage.battery===undefined||localStorage.battery==="null")?0:localStorage.battery;
			var bpm=(localStorage.HRM===undefined||localStorage.HRM==="null")?0:localStorage.HRM;
			var formattedDateGPS =('0' + (date.getMonth() + 1)).slice(-2) + '/' +   ('0' + date.getDate()).slice(-2)+ ',' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2)+ ':' +('0' + date.getSeconds()).slice(-2)+offset;

			var otherdetails = bpm +' BPM '+ steps +' steps '+battery+'% bLvl';
			var pingRateTXT;
			var pingrate=(localStorage.getItem("timerValue2")==undefined||localStorage.getItem("timerValue2")=="null")?(localStorage.getItem("timerValue1")==undefined||localStorage.getItem("timerValue1")=="null")?"OFF":localStorage.getItem("timerValue1"):localStorage.getItem("timerValue2");
			if(pingrate=="OFF"||pingrate=="0"){
				pingRateTXT="OFF";
			}else{
				pingrate=pingrate/1000;
				if(pingrate>=60){
					pingrate=Math.round(pingrate/60.0);
					
					pingRateTXT=pingrate+=" Min";
				}else{
				//	pingrate=math.round(pingrate);
					pingRateTXT=pingrate+=" Sec";
				}
				
			}
			
			var speed=(localStorage.speedGPS===undefined||localStorage.speedGPS==="null")?0:localStorage.speedGPS;
			var date2=new Date(gpsDate);         //Getting How old the GPS data is?
			console.log(date2);
			var date1=new Date();
			var timeStamp=date1-date2;
			var totalSec =timeStamp / 1000;
			var hours = parseInt( totalSec / 3600 ) % 24;
			var minutes = parseInt( totalSec / 60 ) % 60;
			var seconds = totalSec % 60;

			var dateToAttach=formattedDateGPS+' ago - '+hours+' Hrs,'+minutes+' Min '+Math.round(seconds)+' Sec : '+speed + ' Mph| '+otherdetails+' Ping '+pingRateTXT;
			var url="URL"+'@'+"http://maps.google.com/maps?q="+lat+','+long;
			url=url+' ,'+dateToAttach+'!';
			console.log('text out : ' + url);
			sendCommand(url);
			

		} else if (message === 'stopped') {
			sendCommand('exit');
		} else if (message === 'test') {
			sendCommand('test');
		}else if (message === 'exit') {
			if (remoteMessagePort) {
				remoteMessagePort = null;
			}
			
			
			if (localMessagePort) {
				try {
					localMessagePort
					.removeMessagePortListener(localMessagePortWatchId);
					localMessagePort = null;
				} catch (error) {
					console.error(error);
				}
			}
		}else if(ctsData[0]=="cts"){ 
			if(ctsData[1]=="del"){
				if(ctsData[2]!=undefined||ctsData[2]!="null"){
					deleteSimple(ctsData[2]);
				}else{
					return true;
				}
			}else if(ctsData[1]=="add"){
				console.log("Here 1");
				var data={srno:ctsData[2],fname:ctsData[3],lname:ctsData[4],number:ctsData[5]}
				managects(data);
				getXMLOther(localStorage.IMEI,"ContactUpdate",message);  //For other changes requests
			}	
		}else{
			console.log(message);
			var text=message.split(",");
			console.log(text[0]+"and"+text[1]);
			var str=message;
			var res = str.split(",");
			if(res[0].toLowerCase()=="ping_rate"){
				stopWatchFunc();                               //Stopping previous watch GPS
				watchFunc();                                    //Watching the request back to serverGPS
				localStorage.setItem("IsWatch", "true");
				command=res[0];
				checkcodeid=res[1],
				timeinSeconds=res[2];
				if(timeinSeconds=="0"){
					try{
						stopThecall();
						stopWatchFunc();                         //Stop the GPS Watch request
						localStorage.setItem("IsWatch", "false");
						localStorage.removeItem("timerValue2");  //Stopping the frequency timer
						localStorage.removeItem("timerValue1");
						localStorage.setItem("stopItAll","yes");
						setPingrateValue();                      //Update pingRate text
						getXMLOther(localStorage.IMEI,checkcodeid,str); //For other changes requests
					}catch(err){
						console.log("exception occured"+err);
						getXMLnak(imei,cmdID,str);
					}

				}else{
					try{
						timeinSeconds=timeinSeconds*1000;
						watchFunc();                                     //watch GPS data
						localStorage.setItem("timerValue2", timeinSeconds);
						startThecall();                                 //Changing the timer frequency
						localStorage.removeItem("stopItAll");
						setPingrateValue();                             //Update pingRate text
						getXMLOther(localStorage.IMEI,checkcodeid,str); //For other changes requests
					}catch(err){
						console.log("exception occured"+err);
						getXMLnak(imei,cmdID,str);
					}

				}

			}else if(res[0].toLowerCase()=="ping_loc"){
				try{
					command=res[0];
					checkcodeid=res[1];
					setTimeout(function(){
						getXML(panic,checkcodeid);                      //For Location change with all XML
						getXMLOther(localStorage.IMEI,checkcodeid,str); //For other changes requests
					}, 5000);
				}catch(err){
					console.log("exception occured"+err);
					getXMLnak(imei,cmdID,str);
				}

			}
			else if(res[0].toLowerCase()=="ping_stop"){
				try{
					command=res[0];
					checkcodeid=res[1];
					stopThecall();                                 //Stopping the frequency timer
					stopWatchFunc();                               //Stop the GPS Watch request
					localStorage.setItem("IsWatch", "false");
					localStorage.removeItem("timerValue2");  //Stopping the frequency timer
					localStorage.removeItem("timerValue1");
					localStorage.setItem("stopItAll","yes");
					setPingrateValue();                      //Update pingRate text
					getXMLOther(localStorage.IMEI,checkcodeid,str); //For other changes requests
				}catch(err){
					console.log("exception occured"+err);
					getXMLnak(imei,cmdID,str);
				}

			}
			else if(res[0].toLowerCase()=="queue"){
				try{
					command=res[0];
					checkcodeid=res[1];
					url=res[2];
					localStorage.setItem("serviceURL2",url);         //URL changed
					getXMLOther(localStorage.IMEI,checkcodeid,str);  //For other changes requests
				}catch(err){
					console.log("exception occured"+err);
					getXMLnak(imei,cmdID,str);
				}

			}else if(res[0].toLowerCase()=="bpm_freq"){
				command=res[0];
				checkcodeid=res[1],
				timeinMinutes=res[2];
				if(timeinMinutes=="0"){
					try{
						stopThecall();
						localStorage.removeItem("HRMValue2");//Stopping the frequency timer
						getXMLOther(localStorage.IMEI,checkcodeid,str); //For other changes requests
					}catch(err){
						getXMLnak(imei,cmdID,str);
					}

				}else{
					try{
						timeinMinutes=timeinMinutes*60000;
						localStorage.setItem("HRMValue2", timeinMinutes);
						startThecallHRM();                             //Changing the timer frequency
						getXMLOther(localStorage.IMEI,checkcodeid,str); //For other changes requests
					}catch(err){
						getXMLnak(imei,cmdID,str);
					}

				}

			}else{
				return true;
			}

		}
	}

	/**
	 * Initializes message port.
	 */
	function startMessagePort() {
		try {
			localMessagePort = tizen.messageport
			.requestLocalMessagePort(LOCAL_MESSAGE_PORT_NAME);
			localMessagePortWatchId = localMessagePort
			.addMessagePortListener(function onDataReceive(data, remote) {
				onReceive(data, remote);
			});
		} catch (e) {
			localMessagePort = null;
			console.log(e.name);
		}

		try {
			remoteMessagePort = tizen.messageport
			.requestRemoteMessagePort(SERVICE_APP_ID, SERVICE_PORT_NAME);
		} catch (ex) {
			remoteMessagePort = null;
			console.log(ex.name);
		}

		isStarting = false;

		//sendCommand('connect');
	}


	/**
	 * Performs action when getAppsContext method of tizen.application API
	 * results in error.
	 *
	 * @param {Error} err
	 */
	function onGetAppsContextError(err) {
		console.error('getAppsContext exc', err);
	}


	/**
	 * Launches hybrid service application.
	 */
	launchServiceApp = function launchServiceApp() {
		function onSuccess() {
			start();
		}

		function onError(err) {
			console.error('Service Applaunch failed', err);
			isStarting = false;
			console.log('Failed to launch HybridServiceApp!');
		}

		try {
			tizen.application.launch(SERVICE_APP_ID, onSuccess, onError);
		} catch (exc) {
			console.error('Exception while launching HybridServiceApp: ' +
					exc.message);
			console.log('Exception while launching HybridServiceApp:<br>' +
					exc.message);
		}
	};



	/**
	 * Performs action on a list of application contexts
	 * for applications that are currently running on a device.
	 *
	 * @param {ApplicationContext[]} contexts
	 */
	function onGetAppsContextSuccess(contexts) {
		var i = 0,
		len = contexts.length,
		appInfo = null;

		for (i = 0; i < len; i = i + 1) {
			try {
				appInfo = tizen.application.getAppInfo(contexts[i].appId);
			} catch (exc) {
				console.error('Exception while getting application info: ' +
						exc.message);
				console.log('Exception while getting application info:<br>' +
						exc.message);
			}

			if (appInfo.id === SERVICE_APP_ID) {
				break;
			}
		}

		if (i >= len) {
			launchServiceApp();
		} else {
			startMessagePort();
		}
	}

	/**
	 * Starts obtaining information about applications
	 * that are currently running on a device.
	 */
	function start() {
		try {
			tizen.application.getAppsContext(onGetAppsContextSuccess,
					onGetAppsContextError);
		} catch (e) {
			console.log('Get AppContext Error: ' + e.message);
		}
	}

})();











