
var rflag = false;

function resize (e) {
	console.log ("resize... " + rflag + " " + e.offsetX + " " + e.button);
	if (rflag) {
		e.stopImmediatePropagation();
		var w = $(window).width();
		var ratio = e.clientX / w * 100;
		var resize =  ratio + "% 4px " + (99-ratio) + "%";
		$("#container").css("grid-template-columns", resize);
	console.log ("resize: " + resize );
	console.log ("container: " + $("#container").css("grid-template-columns"));
	}
}

// $("#rsize").mouseup		( function() { rflag = false; console.log ("resize end " + rflag); } );
// $("#rsize").mousedown	( function() { rflag = true; console.log ("resize start " + rflag); } );
// $("#rsize").mousemove	( (event) => { resize (event); });
