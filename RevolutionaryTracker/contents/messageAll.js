/*global tau */
(function(){

	var page = document.getElementById( "swipelist2" ),
		listElement = page.getElementsByClassName( "ui-swipelist-list" )[0],
		swipeList;
	var SCROLL_STEP = 10;
	
	
	
	var SERVICE_APP_ID = 'R70X8j9Ivq.service_new1',
	SERVICE_PORT_NAME = 'SAMPLE_PORT',
	LOCAL_MESSAGE_PORT_NAME = 'SAMPLE_PORT_REPLY',
	localMessagePort = null,
	remoteMessagePort = null,
	localMessagePortWatchId = null,
	isStarting = false,
	launchServiceApp = null;
	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener( "pagebeforeshow", function() {
		$( "#ulntemplate1").unbind('click').on("click","li.nope", function(event) { 
			var message=event.target.innerText;
			var number=localStorage.messagenumber;
			var combinedmsg=number+"@"+message+"!";
			sendCommand(combinedmsg);
			localStorage.setItem("alertText", "Message Sent!"); 
			localStorage.setItem("callPage", "ok"); //Alert Stuff
			tau.changePage("alert.html");
		});		
		
		
		
		startMessagePort();

		// registering rotary events
		elScroller = page.querySelector(".ui-scroller");

		/* Rotary event handler */
		rotaryEventHandler = function(e)
		{

			if (e.detail.direction === "CW")
				/* Right direction */
			{
				debugger;
				elScroller.scrollTop += SCROLL_STEP;
			}
			else if (e.detail.direction === "CCW")
				/* Left direction */
			{
				debugger;
				elScroller.scrollTop -= SCROLL_STEP;
			}
		};
		document.addEventListener("rotarydetent", rotaryEventHandler, false);
	});

	/**
	 * pagebeforehide event handler
	 * Destroys and removes event listeners
	 */
	page.addEventListener( "pagebeforehide", function() {
		
	});
	
	
	
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
		}
	}

	/**
	 * Performs action after receiving message from another application.
	 *
	 * @param {MessagePortDataItem[]} data
	 */
	function onReceive(data) {
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
		if (message === 'stopped') {
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

		sendCommand('connect');
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

}());