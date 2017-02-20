/*global tau */
(function(){
	var page = document.getElementById( "swipelist" ),
	listElement = page.getElementsByClassName( "ui-swipelist-list" )[0],
	swipeList;
	var SCROLL_STEP = 10;
	var list;
	var ul = document.getElementById("ulcts");

	var t, tt;
	var  productList;

//	adding Swipe Events(Left/right)
	var slist = document.getElementById("swipelist");
	slist.addEventListener("swipelist.left", function(evt) {
		var number=evt.target.getAttribute("value");
		var number1="tel:"+number;
		var appControl = new tizen.ApplicationControl("http://tizen.org/appcontrol/operation/call",
				number1, null, null, null, null);

		tizen.application.launchAppControl(appControl, null,
				function() {console.log("launch application control succeed");},
				function(e) {console.log("launch application control failed. reason: " + e.message);},
				null);
	});

	slist.addEventListener("swipelist.right", function(evt) {
		var number=evt.target.getAttribute("value");
		localStorage.setItem("messagenumber", number);
		tau.changePage("list_normal.html");
	});


	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener( "pagebeforeshow", function  pageScrollHandler(e) {
		ul.innerHTML="";
		productList=JSON.parse(localStorage.ctslist);
		productList.forEach(renderProductList);

		function renderProductList(element, index, arr) {
			if(index>3){
				return true;
			}else{
				var li = document.createElement('li');
				li.setAttribute('class','item');
				li.setAttribute('value',element.number);

				ul.appendChild(li);
				var src="../css/images/contacts/img"+index+".jpg";
				console.log(src);
				var fullname=element.fname+" "+element.lname;
				t = document.createTextNode(fullname);
				var html="<div class='imgcts'><img src="+src+"  class='imgSwipelist'></div><span id='firstctsname' class='ctsname'>"+fullname+"</span><span class='ctsno' id='firstctsno'>"+element.number+"</span>";

				li.innerHTML=li.innerHTML + html;	
			}
		}





		// registering rotary events
		page = e.target;
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


	page.addEventListener( "pageshow", function  pageScrollHandler(e) {
		// make SwipeList object
		swipeList = tau.widget.SwipeList( listElement, {
			swipeTarget: "li",
			swipeElement: ".ui-swipelist"
		});
	});


	/**
	 * pagebeforehide event handler
	 * Destroys and removes event listeners
	 */
	page.addEventListener( "pagebeforehide", function() {
		// release object
		swipeList.destroy();
	});



}());
