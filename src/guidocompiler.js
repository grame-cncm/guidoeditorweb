
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

function xmlversion (lxml) {
	console.log( "LibMusicXML version " + lxml.libVersionStr());
	$("#lxmlversion").html (lxml.libVersionStr());
	console.log( "MusicXML to GMN converter version " + lxml.musicxml2guidoVersionStr());
	$("#xml2guidoversion").html (lxml.musicxml2guidoVersionStr());
}

//----------------------------------------------------------------------------
// the guido engine part
//----------------------------------------------------------------------------
class GuidoCompiler {
	constructor() {
		this.fEngine = 0;
		this.fMusicxml = 0;
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

	//------------------------------------------------------------------------
	// initialization
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
	

	//------------------------------------------------------------------------
	// the display methods
 	svg (page, embed=true) 	{ return this.fGR ? this.fEngine.gr2SVGColored ( this.fGR, page, this.fColor.r, this.fColor.g, this.fColor.b, embed) : ""; }	


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

	//------------------------------------------------------------------------
	// the compilation process
	ar2gr( ar ) {
		if (ar) {
			if (this.fGR) this.fEngine.freeGR (this.fGR);	
			this.fGR = this.fEngine.ar2grSettings ( ar, this.fCurrentSettings);
			this.display ();
 			this.fPRoll.process (ar);
 			this.fSPR.process (ar);
		}
	}

	process(gmn) {
		if ( !gmn || !gmn.trim()) { 
			this.clear(); 
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

	resfresh() { this.ar2gr (this.fAR); }
	setDefaultSettings () 	{ 
		this.fCurrentSettings = this.fEngine.getDefaultLayoutSettings(); 
		this.fCurrentSettings.optimalPageFill = false;
	}


	//------------------------------------------------------------------------
	// scan the current location to detect code of src parameters
	scanUrl() {
		var arg = window.location.search.substring(1);
		var n = arg.search("=");
		if (n >= 0) { 
			var name  = arg.substr(0,n);
			var value = arg.substr(n+1);
			switch (name) {
				case "code":
					this.fEditor.setGmn(atob(value), "");
					break;
				case "src":
					var oReq = new XMLHttpRequest();
					oReq.onload = () => { this.fEditor.setGmn( oReq.responseText, value); };
					oReq.open("get", value, true);
					oReq.send();					
					break;
			}
		}
	}


	//------------------------------------------------------------------------
	// show all pages
	showAll () 			{ this.fPagesMode = "all"; this.display(); }
	// show the last page only
	showLast () 		{ this.fPagesMode = "last"; this.display(); }
	// show a list of pages
	showPages (pages) 	{ this.fPagesMode = "pages"; this.fPages=pages; this.display(); }
	// show or hide score elements
	showElement ( elt, status) {
		if (this.fGR) {
			this.fEngine.showElement (this.fGR, elt, status);
			this.display (this.pageCount);
		}
	}

	//------------------------------------------------------------------------
	// show processing times
	showTime() {
		var ptime = this.fEngine.getParsingTime(this.fAR);
		var ctime = this.fEngine.getAR2GRTime(this.fGR);
		$("#ptime").html(ptime);
		$("#agtime").html(ptime);
		$("#dtime").html(this.fDrawTime);
		$("#ttime").html(ptime + ctime + this.fDrawTime);
	}


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

	setGmn (code, path) 	{ this.fEditor.setGmn (code, path) };
	
	//------------------------------------------------------------------------
	// save methods
	saveGMN () 			{ download (this.filename + ".gmn",  this.fEditor.value); }
	saveHTML () 		{ download (this.filename + ".html", this.html); }
	saveSVGPRoll () 	{ download (this.filename + ".pianoroll.svg", this.fPRoll.svg); }
	saveHTMLPRoll () 	{ download (this.filename + ".pianoroll.html", this.fPRoll.html); }
	saveSVGPSPR () 		{ download (this.filename + ".spr.svg", this.fSPR.svg); }
	saveHTMLSPR () 		{ download (this.filename + ".spr.html", this.fSPR.html); }
	saveSVG () 	{ 
		var pcount = this.pageCount;
		if (pcount == 1) download (this.filename + ".svg",  this.svg(1)); 
		else for (var i = 1; i <= pcount; i++) {
			var file = this.filename;	
			download (file + "-page" + i + ".svg",  this.svg(i)); 
		}
	}
	
	//------------------------------------------------------------------------
	// get methods
	get settings()			{ return this.fCurrentSettings; }

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

	get pageCount() 	{ return this.fGR ? this.fEngine.getPageCount (this.fGR) : 0; }	


	//------------------------------------------------------------------------
	// set methods
	set color( c ) { 
		this.fColor = c;
		this.display (this.pageCount);
	};

}

const guidoEditor = new GuidoCompiler();
guidoEditor.initialize (guidoEditor);
const lxml = new libmusicxml();
lxml.initialize ().then ( xmlversion );

