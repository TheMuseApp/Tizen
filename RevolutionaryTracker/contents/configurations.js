/*global tau */
(function(){

	var page = document.getElementById( "configurations" );
	var SCROLL_STEP = 25;

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener( "pagebeforeshow", function pageScrollHandler(e) {
		
		// add rotary
		var page = e.target;
	    elScroller = page.querySelector(".ui-scroller");

	    /* Rotary event handler */
	    rotaryEventHandler = function(e)
	    {
	       if (e.detail.direction === "CW")
	       /* Right direction */
	       {
	          elScroller.scrollTop += SCROLL_STEP;
	       }
	       else if (e.detail.direction === "CCW")
	       /* Left direction */
	       {
	          elScroller.scrollTop -= SCROLL_STEP;
	       }
	    };

	    /* Register the rotary event */
	    document.addEventListener("rotarydetent", rotaryEventHandler, false);  
	});
}());
