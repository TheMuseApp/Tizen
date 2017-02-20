/*global tau */
(function(){

	var page = document.getElementById( "bottomButtonPage" );
	page.addEventListener( "pagebeforeshow", function pageScrollHandler(e) {
		//alert("LetsDo it");
		document.getElementById("alertok").addEventListener("click", function(){
			var test;
			if(localStorage.callPage!=undefined||localStorage.callPage!="null"){
				 test=localStorage.callPage;
			}
			if(test=="ok"){
				tau.changePage("list_swipelist.html");
			}else{
				window.history.back();
			}
		
		});
		
		/*localStorage.setItem("alertText", "Contacts not ready to make call!");*/
		document.getElementById("alertText").innerHTML=localStorage.alertText==undefined||localStorage.alertText=="null"?" ":localStorage.alertText;
		
	});
	page.addEventListener( "pageshow", function pageScrollHandler(e) {
		setTimeout(function(){
			//alert("trying");
			var page = document.getElementsByClassName( 'ui-page-active' )[0];
			var pageid = page ? page.id : "";
			var test;
			if(localStorage.callPage!=undefined||localStorage.callPage!="null"){
				 test=localStorage.callPage;
			}
			
            			
			if(pageid === "bottomButtonPage"&& test=="ok") {
				tau.changePage("list_swipelist.html");
			}else if( pageid === "bottomButtonPage"){
				window.history.back();
			}
		},10000);
	});
	
	
	page.addEventListener("pagebeforehide", function(event) {
		localStorage.removeItem("alertText");
	}, false);
}());
