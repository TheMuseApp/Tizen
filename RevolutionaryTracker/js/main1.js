(function(){
	$.extend({ alert: function (message, title) {
		  $("<div></div>").dialog( {
		    buttons: { "Ok": function () { $(this).dialog("close"); } },
		    close: function (event, ui) { $(this).remove(); },
		    resizable: false,
		    title: title,
		    modal: true
		  }).text(message);
		}
		});
	
})();