
"use strict";

//----------------------------------------------------------------------------
// a download function
//----------------------------------------------------------------------------
function download (filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

//----------------------------------------------------------------------------
// this is the editor part, currently using CodeMirror
//----------------------------------------------------------------------------
class GuidoEditor {
	
	constructor (divID, compiler) {
		this.fEditor = CodeMirror.fromTextArea (document.getElementById (divID), {
			lineNumbers: true,
			mode: 'guido',
			theme: 'default',
			smartIndent: true,
			tabSize: 4,
			lineWrapping: true,
			indentWithTabs: true,
			matchBrackets: true,
			autoCloseBrackets: true
		});
		this.initialize (compiler);
	}
	
	initialize (compiler) {
  		this.fEditor.on('change', 		(editor,e) => { compiler.process (this.value); } );
		this.fEditor.on("dragstart",	(editor,e) => {});
		this.fEditor.on("dragenter",	(editor,e) => { $("#editor").css( "opacity", 0.3 ); });
		this.fEditor.on("dragleave",	(editor,e) => { $("#editor").css( "opacity", 1 ); });
		this.fEditor.on("drop",			(editor,e) => { 
			$("#editor").css( "opacity", 1 );
			var data = e.dataTransfer.getData("text");
			if (!data) {
				e.stopPropagation();
				e.preventDefault();
				let filelist = e.dataTransfer.files;
				if (!filelist) return;
			
				let filecount = filelist.length;
				for (let i = 0; i < filecount; i++ )
					this.drop (filelist[i]);
			}
		});
		$("#font-family").change 	( (event) => { this.fEditor.getWrapperElement().style["font-family"] =  $("#font-family").val(); } ); 
		$("#font-size").change 		( (event) => { this.fEditor.getWrapperElement().style["font-size"] =  $("#font-size").val() + "px"; console.log("font change"); } ); 
		$("#etheme").change 		( (event) => { this.fEditor.setOption("theme", $("#etheme").val()); } );
		$("#wraplines").change 		( (event) => { this.fEditor.setOption("lineWrapping",  $("#wraplines").is(":checked")); } );

		this.fEditor.getWrapperElement().style["font-family"] =  $("#font-family").val();
		this.fEditor.getWrapperElement().style["font-size"] =  $("#font-size").val() + "px"; 
		this.fEditor.setOption("theme", $("#etheme").val());
		this.fEditor.setOption("lineWrapping",  $("#wraplines").is(":checked"));

	}
	
	setGmn( gmn, path) {
		$("#gmn-name").text (path);
		this.fEditor.setValue(gmn);
		this.fEditor.refresh();
	} 

	drop (file) {
		let reader = new FileReader();				
		reader.onload = (event) => { this.setGmn (reader.result, file.name); };
		reader.readAsText(file);
	}
	
	select(line, col) 	{ this.fEditor.setSelection( {line: line, ch: col-1}, {line: line, ch: col} ) };
	resize(h) 			{ $("div.CodeMirror").css("height", h) };
	get value() 		{ return this.fEditor.getValue(); }
}


//----------------------------------------------------------------------------
// Piano roll representation
//----------------------------------------------------------------------------
class GuidoPRoll {
	constructor(engine) {
		this.fPRollEngine = engine;
		this.fPRoll = 0;
		this.fKbd = false;
		this.fBars = false;
		this.fColors = false;
		this.fLines = false;
	}

 	get svg () 	{ return this.fPRoll ? this.fPRollEngine.svgExport (this.fPRoll, 1024, 512) : ""; }	
 	get html () { 
 		var str = '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html;charset=utf-8"></head>\n';
		str += '<style>\ndiv { margin: 20px; padding: 30px; background-color: #efefef; border-radius: 10px; }\n</style>\n'; 
		str += '<body><div>\n';
		str +=  $("#proll").html();
		str += '</div></body></html>\n';
		return str;
	}	

	showKbd( state )	{ this.fKbd = state; 	this.display(); }
	showBars( state )	{ this.fBars = state; 	this.display(); }
	showColors( state )	{ this.fColors = state; this.display(); }
	hideLines( state )	{ this.fLines = state; 	this.display(); }

	display() {
		if (this.fPRoll) {
			this.fPRollEngine.enableKeyboard (this.fPRoll, this.fKbd);
			this.fPRollEngine.enableMeasureBars (this.fPRoll, this.fBars);
			this.fPRollEngine.enableAutoVoicesColoration (this.fPRoll, this.fColors);
			this.fPRollEngine.setPitchLinesDisplayMode (this.fPRoll, this.fLines ? -1 : 0);
	 		$("#proll").html(this.svg);	
 		}
	}

	process(ar) {
		if (this.fPRoll) this.fPRollEngine.destroyPianoRoll (this.fPRoll);
		this.fPRoll = this.fPRollEngine.ar2PianoRoll (0, ar);
 		this.display();	
	}

	clear () {
		if (this.fPRoll) this.fPRollEngine.destroyPianoRoll (this.fPRoll);
		this.fPRoll = 0;
		$("#proll").html("");
	}
}

//----------------------------------------------------------------------------
// Simplified proportional representation
//----------------------------------------------------------------------------
class GuidoSPR {
	constructor (engine) {
		this.fSPREngine = engine;
		this.fSPR = 0;
		this.fBars = false;
		this.fColors = false;
		this.fLines = true;
	}

 	get svg () 	{ return this.fSPR ? this.fSPREngine.svgExport (this.fSPR, 1024, 512) : ""; }	
 	get html () { 
 		var str = '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html;charset=utf-8"></head>\n';
		str += '<style>\ndiv { margin: 20px; padding: 30px; background-color: #efefef; border-radius: 10px; }\n</style>\n'; 
		str += '<body><div>\n';
		str +=  $("#spr").html();
		str += '</div></body></html>\n';
		return str;
	}	

	showBars( state )	{ this.fBars = state; 	this.display(); }
	showColors( state )	{ this.fColors = state; this.display(); }
	hideLines( state )	{ this.fLines = state; 	this.display(); }

	display() {
		if (this.fSPR) {
			this.fSPREngine.enableMeasureBars (this.fSPR, this.fBars);
			this.fSPREngine.enableAutoVoicesColoration (this.fSPR, this.fColors);
			this.fSPREngine.drawDurationLines (this.fSPR, this.fLines);
	 		$("#spr").html(this.svg);	
 		}
	}

	process(ar) {
 		if (this.fSPR) this.fSPREngine.destroyRProportional (this.fSPR);
		this.fSPR = this.fSPREngine.ar2RProportional (ar);
 		this.display();	
	}

	clear () {
		if (this.fSPR) this.fSPREngine.destroyRProportional (this.fSPR);
		this.fSPR = 0;
		$("#spr").html("");
	}
}

//----------------------------------------------------------------------------
// this is the guido engine part
//----------------------------------------------------------------------------
class GuidoCompiler {
	constructor() {
		this.fEngine = 0;
		this.fPRoll = 0;
		this.fSPR = 0;
		this.fParser = 0;
		this.fAR = 0;
		this.fGR = 0;
		this.fCurrentSettings = 0
		this.fEditor = 0
		this.fColor = { r: 0, g: 0, b: 0 };
		this.fDrawTime = 0;
		this.fPages = 0;
		this.fPagesMode = "all";
		$("#savegmn").click			( (event) => { this.saveGMN(); });
		$("#savesvg").click			( (event) => { this.saveSVG(); });
		$("#savehtml").click		( (event) => { this.saveHTML(); });
		$("#savesvgproll").click	( (event) => { this.saveSVGPRoll(); });
		$("#savehtmlproll").click	( (event) => { this.saveHTMLPRoll(); });
		$("#savesvgspr").click		( (event) => { this.saveSVGPSPR(); });
		$("#savehtmlspr").click		( (event) => { this.saveHTMLSPR(); });
	}

	set color( c ) { 
		this.fColor = c;
		this.display (this.pageCount);
	};

	get pageCount() 	{ return this.fGR ? this.fEngine.getPageCount (this.fGR) : 0; }
	
	displayPage( n, embed ) {
		n = Math.max (n, 1);
		n = Math.min (n, this.pageCount);
		$('<div class="page well">'+this.svg(n, embed)+'</div>').appendTo('#score');
		return this.fEngine.getOnDrawTime(this.fGR);
	}
	
	displayList( pages ) {
		this.fDrawTime = 0;
		$("#score").html("");
		var embed = true;
		pages.forEach( (n) => {
			this.fDrawTime += this.displayPage( n, embed );
			embed = false;
		});
		this.showTime();
		this.fEditor.resize ($("#score").height());
	}
	
	displayPages( from, to ) {
		from = Math.max (from, 1);
		to = Math.min (to, this.pageCount);
		this.fDrawTime = 0;
		$("#score").html("");
		for (var i = from; i <= to; i++) {
			$('<div class="page well">'+this.svg(i)+'</div>').appendTo('#score');
			this.fDrawTime += this.fEngine.getOnDrawTime(this.fGR);
		}
		this.showTime();
		this.fEditor.resize ($("#score").height());
	}

	
	display() {
		if (!this.fGR) return;
		switch (this.fPagesMode) {
			case 'pages': 
				this.displayList (this.fPages);
				break
			case 'last':	
				this.displayPages( this.pageCount, this.pageCount);
				break
			case 'all':
			default:
				this.displayPages( 1, this.pageCount);
				break
		}
	}

	ar2gr( ar ) {
		if (ar) {
			if (this.fGR) this.fEngine.freeGR (this.fGR);	
			this.fGR = this.fEngine.ar2grSettings ( ar, this.fCurrentSettings);
			this.display ();
 			this.fPRoll.process (ar);
 			this.fSPR.process (ar);
		}
	}

	showTime() {
		var ptime = this.fEngine.getParsingTime(this.fAR);
		var ctime = this.fEngine.getAR2GRTime(this.fGR);
		$("#ptime").html(ptime);
		$("#agtime").html(ptime);
		$("#dtime").html(this.fDrawTime);
		$("#ttime").html(ptime + ctime + this.fDrawTime);
	}

	process(gmn) {
		if ( !gmn || !gmn.trim()) { 
			clear(); 
			return;
		}

		if (this.fAR) this.fEngine.freeAR (this.fAR);	
		this.fAR = this.fEngine.string2AR (this.fParser, gmn);
		if (this.fAR) {
			this.ar2gr (this.fAR);
			$("#gmn-error").text ("");
		}
		else {
			var error = this.fEngine.parserGetErrorCode( this.fParser );
			$("#gmn-error").text (error.msg + " line " + error.line + " col " + error.col);
			$("#gmn-error").click ( () => { this.fEditor.select( error.line-1, error.col-1 ) });
		}
	}

	scanUrl() {
		var arg = window.location.search.substring(1);
		var n = arg.search("="); console.log("n=" +n);
		if (n >= 0) { 
			var name  = arg.substr(0,n);
			var value = arg.substr(n+1);
			switch (name) {
				case "code":
					this.fEditor.setGmn(atob(value), "");
					break;
				case "src":
					var oReq = new XMLHttpRequest();
					oReq.onload = () => { this.fEditor.setGmn( oReq.responseText, ""); };
					oReq.open("get", value, true);
					oReq.send();					
					break;
			}
		}
	}

	initialize(compiler) {
		var module = GuidoModule();
		module['onRuntimeInitialized'] = () => {
			this.fEngine = new module.GuidoEngineAdapter();
			var version = this.fEngine.getVersion();
			console.log( "Guido Engine version " + version.str);
			$("#version").html (version.str);
			this.fEngine.init();
			this.fParser 			= this.fEngine.openParser();
			this.fCurrentSettings  	= this.fEngine.getDefaultLayoutSettings();

			this.fPRoll  = new GuidoPRoll(new module.GUIDOPianoRollAdapter());
			this.fSPR  = new GuidoSPR(new module.GUIDOReducedProportionalAdapter());
			this.fEditor = new GuidoEditor ("code", this);
			var settings = new GuidoSettings (this);
			this.fColor = settings.color;
			this.scanUrl();
 			this.process (this.fEditor.value);
		}
	}

	get filename () { 
		var str = $("#gmn-name").text();
		if (!str || !str.trim()) return "untitled";
		str = str.replace(/.*\//, "");
		return str.replace(/\.gmn$/, "");
	}
	get html () { 
		var str = '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html;charset=utf-8">\n';
		str += '<link rel="stylesheet" href="http://guidoeditor.grame.fr/font/stylesheet.css" type="text/css" /></head>\n';
		str += '<style>\n.page { margin: 20px; padding: 20px; background-color: #efefef;}\n.well { border-radius: 10px; }\n</style>\n'; 
		str += '<body><div>\n';
		str +=  $("#score").html();
		str += '</div></body></html>\n';
		return str;
	}
 	svg (page, embed=true) 	{ return this.fGR ? this.fEngine.gr2SVGColored ( this.fGR, page, this.fColor.r, this.fColor.g, this.fColor.b, embed) : ""; }	
	saveSVG () 	{ 
		var pcount = this.pageCount;
		if (pcount == 1) download (this.filename + ".svg",  this.svg(1)); 
		else for (var i = 1; i <= pcount; i++) {
			var file = this.filename;	
			download (file + "-page" + i + ".svg",  this.svg(i)); 
		}
	}

	showAll () 			{ this.fPagesMode = "all"; this.display(); }
	showLast () 		{ this.fPagesMode = "last"; this.display(); }
	showPages (pages) 	{ this.fPagesMode = "pages"; this.fPages=pages; this.display(); }

	saveGMN () 			{ download (this.filename + ".gmn",  this.fEditor.value); }
	saveHTML () 		{ download (this.filename + ".html", this.html); }
	saveSVGPRoll () 	{ download (this.filename + ".pianoroll.svg", this.fPRoll.svg); }
	saveHTMLPRoll () 	{ download (this.filename + ".pianoroll.html", this.fPRoll.html); }
	saveSVGPSPR () 		{ download (this.filename + ".spr.svg", this.fSPR.svg); }
	saveHTMLSPR () 		{ download (this.filename + ".spr.html", this.fSPR.html); }

	clear () {
		if (this.fAR) this.fEngine.freeAR (this.fAR);	
		if (this.fGR) this.fEngine.freeGR (this.fGR);	
		this.fAR = 0;
		this.fGR = 0;
		this.fPRoll.clear ();
		$("#gmn-name").text ("");
		$("#score").html("");
		$("#spr").html("");
		$("#gmn-error").text ("");
	}

	resfresh() { this.ar2gr (this.fAR); }

	showElement ( elt, status) {
		if (this.fGR) {
			this.fEngine.showElement (this.fGR, elt, status);
			this.display (this.pageCount);
		}
	}

	setGmn (code, path) 	{ this.fEditor.setGmn (code, path) };
	setDefaultSettings () 	{ this.fCurrentSettings = this.fEngine.getDefaultLayoutSettings(); }
	
	get settings()			{ return this.fCurrentSettings; }
	
}

const guidoEditor = new GuidoCompiler();
guidoEditor.initialize (guidoEditor);

