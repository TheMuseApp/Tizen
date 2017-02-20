( function () {
	window.addEventListener( 'tizenhwkey', function( ev ) {
		if( ev.keyName === "back" ) {
			var page = document.getElementsByClassName( 'ui-page-active' )[0];
			var pageid = page ? page.id : "";
			if( pageid === "main" ) {
				try {
					tizen.application.getCurrentApplication().hide();
				} catch (ignore) {
				}
			} else if( pageid === "settings" ) {
				tau.changePage("../index.html");
			}else if( pageid === "swipelist" ) {
				tau.changePage("../index.html");
			}else {
				window.history.back();
			}
		}
	} );



	// registering rotary events
	var SCROLL_STEP = 10;
	//page = e.target;
	elScroller = document.querySelector(".ns");

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

} () );
