


//----------------------------------------------------------------------------
// the guido engine settings managament
//----------------------------------------------------------------------------
class GuidoSettings {
	constructor ( engine ) {
		this.fEngine = engine;
		this.initialize();
		this.setDefault();
	}

	refresh() 			{ this.fEngine.resfresh(); }
	get settings () 	{ return this.fEngine.settings; }


	setDefault () {
		this.fEngine.setDefaultSettings();
		this.display ();

		$("#hideslurs").prop('checked', false);
		$("#hidedyn").prop('checked', false);
		$("#hideart").prop('checked', false);
		$("#hidetext").prop('checked', false);
		$("#hidelyrics").prop('checked', false);
		this.refresh ();
	}

	moveLinked (from, div, link) {
		var val = $(from).val(); 
		$(link).val ( val ); 
		return div ? val / div : val;
	}

	setColor () 	{ this.fEngine.color =  this.color; }
	get color () {
		var val =  $("#score-color").val();
		var rstr = val.substring(1, 3);
		var gstr = val.substring(3, 5);
		var bstr = val.substring(5);
		return  { r: parseInt(rstr, 16), g: parseInt(gstr, 16), b: parseInt(bstr, 16) };
	}

	display () {
		$("#spring-slider").val ( Math.round( this.settings.spring * 100));
		$("#spring-num").val 	( Math.round( this.settings.spring * 100));
		$("#force-slider").val 	( this.settings.force );
		$("#force-num").val 	( this.settings.force );

		$("#check-lyrics").prop('checked', this.settings.checkLyricsCollisions ? true : false);

		$("#sysdist-slider").val(this.settings.systemsDistance);
		$("#sysdist-num").val	(this.settings.systemsDistance);

		$("#sys-dist").prop		('selectedIndex', this.settings.systemsDistribution - 1);

		$("#maxdist-slider").val( Math.round( this.settings.systemsDistribLimit * 100));
		$("#maxdist-num").val	( Math.round( this.settings.systemsDistribLimit * 100));

		$("#optpagefill").prop	('checked', this.settings.optimalPageFill ? true : false);
		$("#neighborhood").prop	('checked', this.settings.neighborhoodSpacing ? true : false);
		$("#resize").prop		('checked', this.settings.resizePage2Music ? true : false);

	// 	$("#proportional").val	(this.settings.proportionalRenderingForceMultiplicator);
	}
	
	
	range (start, end) { 
		var from = parseInt(start);
		var to = parseInt(end);		
		var p = new Array;
		if (isNaN(from)) return p;
		p.push(from++);
		if (isNaN(to)) return p;
		while (from <= to) p.push(from++);
		return p;
	}

	list (head, tail) { 
		var page = parseInt(head);
		var p = new Array;
		if (isNaN(page)) return p;
		p.push(page);

		var i = tail.search(',');
		if (i > 0) {
			p.push(...this.list(tail.substr(0,i).trim(), tail.substr(i+1).trim()));
			return p;
		}

		var last = parseInt(tail);
		if (!isNaN(last)) p.push(last);
		return p;
	}

	get pages() { 
		var val = $("#pages").val();
		var i = val.search('-');
		if (i > 0)
			return this.range (val.substr(0,i).trim(), val.substr(i+1).trim());
		var i = val.search(',');
		if (i > 0)
			return this.list (val.substr(0,i).trim(), val.substr(i+1).trim());
		
		var page = parseInt(val.trim());		
		var p = new Array;
		if (isNaN(page)) return p;
		p.push (page);
		return p;
	}

	get proll() { return this.fEngine.fPRoll; }
	get spr() 	{ return this.fEngine.fSPR; }

	pageControl(state) {
		$("#pages").prop('disabled', state);
		$("#pages").css('color', state ? '#888888' :  '#000000' );
	}
	
	initialize() {
		$("#spring-slider").mousedown	( (event) => { this.settings.spring = this.moveLinked ("#spring-slider", 100, "#spring-num"); this.refresh(); });
		$("#spring-slider").mousemove	( (event) => { this.settings.spring = this.moveLinked ("#spring-slider", 100, "#spring-num"); this.refresh(); });
		$("#spring-num").keyup			( (event) => { this.settings.spring = this.moveLinked ("#spring-slider", 100, "#spring-slider"); this.refresh(); });
		$("#spring-num").click			( (event) => { this.settings.spring = this.moveLinked ("#spring-slider", 100, "#spring-slider"); this.refresh(); });


		$("#force-slider").mousedown	( (event) => { this.settings.force = this.moveLinked ("#force-slider", 1, "#force-num"); this.refresh(); });
		$("#force-slider").mousemove	( (event) => { this.settings.force = this.moveLinked ("#force-slider", 1, "#force-num"); this.refresh(); });
		$("#force-num").keyup			( (event) => { this.settings.force = this.moveLinked ("#force-num", 1, "#force-slider"); this.refresh(); });
		$("#force-num").click			( (event) => { this.settings.force = this.moveLinked ("#force-num", 1, "#force-slider"); this.refresh(); });

		$("#check-lyrics").click		( (event) => { this.settings.checkLyricsCollisions = $("#force-slider").is(":checked") ? true : false; this.refresh(); });


		$("#sysdist-slider").mousedown	( (event) => { this.settings.systemsDistance = this.moveLinked ("#sysdist-slider", 100, "#sysdist-num"); this.refresh(); });
		$("#sysdist-slider").mousemove	( (event) => { this.settings.systemsDistance = this.moveLinked ("#sysdist-slider", 100, "#sysdist-num"); this.refresh(); });
		$("#sysdist-num").keyup			( (event) => { this.settings.systemsDistance = this.moveLinked ("#sysdist-num", 100, "#sysdist-slider"); this.refresh(); });
		$("#sysdist-num").click			( (event) => { this.settings.systemsDistance = this.moveLinked ("#sysdist-num", 100, "#sysdist-slider"); this.refresh(); });

		$("#maxdist-slider").mousedown	( (event) => { this.settings.systemsDistribLimit = this.moveLinked ("#maxdist-slider", 100, "#maxdist-num"); this.refresh(); });
		$("#maxdist-slider").mousemove	( (event) => { this.settings.systemsDistribLimit = this.moveLinked ("#maxdist-slider", 100, "#maxdist-num"); this.refresh(); });
		$("#maxdist-num").keyup			( (event) => { this.settings.systemsDistribLimit = this.moveLinked ("#maxdist-num", 100, "#maxdist-slider"); this.refresh(); });
		$("#maxdist-num").click			( (event) => { this.settings.systemsDistribLimit = this.moveLinked ("#maxdist-num", 100, "#maxdist-slider"); this.refresh(); });

		$("#sys-dist").click			( (event) => { this.settings.systemsDistribution = $("#sys-dist :selected").index() + 1; this.refresh(); });

		$("#optpagefill").click			( (event) => { this.settings.optimalPageFill 		= $("#optpagefill").is(":checked") ? 1 : 0; this.refresh(); });
		$("#neighborhood").click		( (event) => { this.settings.neighborhoodSpacing 	= $("#neighborhood").is(":checked") ? 1 : 0; this.refresh(); });
		$("#resize").click				( (event) => { this.settings.resizePage2Music 		= $("#resize").is(":checked") ? 1 : 0; this.refresh(); });

		$("#score-color").on			('input', () => { this.moveLinked ("#score-color", 0, "#score-color-num"); this.setColor (); } );
		$("#score-color-num").keyup		( () => { this.moveLinked ("#score-color-num", 0, "#score-color"); this.setColor (); });

		$("#hideslurs").click			( (event) => { this.fEngine.showElement ( 1, $("#hideslurs").is(":checked") ? false : true); });
		$("#hidedyn").click				( (event) => { this.fEngine.showElement ( 2, $("#hidedyn").is(":checked") ? false : true); });
		$("#hideart").click				( (event) => { this.fEngine.showElement ( 3, $("#hideart").is(":checked") ? false : true); });
		$("#hidetext").click			( (event) => { this.fEngine.showElement ( 4, $("#hidetext").is(":checked") ? false : true); });
		$("#hidelyrics").click			( (event) => { this.fEngine.showElement ( 5, $("#hidelyrics").is(":checked") ? false : true); });

		$("#default-settings").click	( () => { this.setDefault(); } );

		$("#allpages").click	( () => { this.pageControl (true);  this.fEngine.showAll(); } );
		$("#somepages").click	( () => { this.pageControl (false); this.fEngine.showPages (this.pages); } );
		$("#lastpages").click	( () => { this.pageControl (true);  this.fEngine.showLast();   } );
		$("#pages").keyup		( () => { this.fEngine.showPages (this.pages); } );

	
		if ($("#allpages").is(':checked')) { this.pageControl (true);  this.fEngine.showAll(); }
		else if ($("#somepages").is(':checked')) { this.pageControl (false);  this.fEngine.showPages(this.pages); }
		else if ($("#lastpages").is(':checked')) { this.pageControl (true);  this.fEngine.showLast(); } 


		$("#showkbd").click		( () => { this.proll.showKbd( $("#showkbd").is(":checked") ); } );
		$("#showbars").click	( () => { this.proll.showBars( $("#showbars").is(":checked") ); } );
		$("#prollcolor").click	( () => { this.proll.showColors( $("#prollcolor").is(":checked") ); } );
		$("#prolllines").click	( () => { this.proll.hideLines( $("#prolllines").is(":checked") ); } );

		this.proll.showKbd( $("#showkbd").is(":checked") );
		this.proll.showBars( $("#showbars").is(":checked") );
		this.proll.showColors( $("#prollcolor").is(":checked") );
		this.proll.hideLines( $("#prolllines").is(":checked") );

		$("#sprbars").click		( () => { this.spr.showBars( $("#sprbars").is(":checked") ); } );
		$("#sprcolor").click	( () => { this.spr.showColors( $("#sprcolor").is(":checked") ); } );
		$("#sprlines").click	( () => { this.spr.hideLines( $("#sprlines").is(":checked") ); } );

		this.spr.showBars( $("#sprbars").is(":checked") );
		this.spr.showColors( $("#sprcolor").is(":checked") );
		this.spr.hideLines( $("#sprlines").is(":checked") );

	}
	
}


