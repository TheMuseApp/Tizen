(function(){

	var page=document.getElementById("stepsPage");
	var db,
	database="RTdb",
	object_Store="pedo";
	var timerId;

	page.addEventListener("pagebeforeshow", function(){

		var steps=localStorage.pedoSteps;
		//alert(steps);
		var contentText = document.querySelector('#steps-text');
		contentText.innerHTML = (steps==undefined)?"0 Steps":steps+' Steps';

		var request = window.indexedDB.open(database, 1);
		request.onerror = function(event) {
			console.log("error: ");
		};
		request.onsuccess = function(event) {
			db = request.result;
			console.log("success: "+ db);
		};


		timerId = setInterval(function(){
			getSteps();
		},5000);
	});

	page.addEventListener("pagebeforehide", function(){
		  clearInterval(timerId);
	});




	//GET steps from db
	function getSteps(){
		var transaction = db.transaction(object_Store,"readwrite");
		var objectStore = transaction.objectStore(object_Store);
		var request = objectStore.openCursor();
		request.onsuccess = function(evt) {  
			var cursor = evt.target.result;  
			if (cursor) { 
				//console.log(cursor);
				var data=cursor.value;
				localStorage.setItem("pedoSteps",data.Pedosteps);
				var steps=data.Pedosteps;
				var contentText = document.querySelector('#steps-text');
				if(contentText!=undefined){
					contentText.innerHTML = (steps=="null" || steps==undefined)?"0 Steps":steps+' Steps';	
				}
				cursor.continue();  
			}  
			else {  
				console.log("No more entries!");  
			}  
		};
	}


})();
