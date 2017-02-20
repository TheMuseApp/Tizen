(function(){
	var page=document.getElementById("hrmPage");
	var counter = 0;
	var partialHRMDiv=document.getElementById("partialHRMDiv");
	var mainHRMDiv=document.getElementById("mainHRMDiv");
	//Page BeforeShow
	page.addEventListener("pagebeforeshow", function() {
		document.getElementById('1btnPopup-cancel').addEventListener('click', function(ev){
			tau.closePopup();
			tau.changePage("settings.html");
		});
	
		window.webapis.motion.start("HRM", onchangedCB);
		 
	});


	function onchangedCB(hrmInfo)
	{
		console.log(hrmInfo.heartRate);

		//mainHRMDiv.style.display="";
		if(hrmInfo.heartRate==-3){
			window.webapis.motion.stop("HRM");
			//alert("Not Detecting! Try Again");
			 tau.openPopup("#1btnPopup");
			//partialHRMDiv.style.display="none";
			//window.history.back();
		}

		if(hrmInfo.heartRate > 0) {
			console.log(hrmInfo.heartRate);
			//alert(hrmInfo.heartRate);
			localStorage.setItem("HRM", JSON.stringify(hrmInfo.heartRate));
			window.webapis.motion.stop("HRM");
			partialHRMDiv.style.display="";
			mainHRMDiv.style.display="none";
			//$("#hrm-text").text('test');
			document.getElementById("hrm-text").innerHTML=hrmInfo.heartRate+"bpm";
		}
	}

})();