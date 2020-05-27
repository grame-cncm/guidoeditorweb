
///<reference path="lib/guidoengine.ts"/>
///<reference path="lib/libmusicxml.ts"/>
///<reference path="guidoeditor.ts"/>
///<reference path="guidoaltview.ts"/>

interface UrlOption  { option: string; value: string; }

//----------------------------------------------------------------------------
// a download function
//----------------------------------------------------------------------------
function download (filename : string, text: string) : void {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

interface rgbColor { r: number, g: number, b: number; }
interface Settings { 
	setDefault() : void;
	color: rgbColor; 
}

//----------------------------------------------------------------------------
// the guido engine part
//----------------------------------------------------------------------------
class GuidoCompiler {

	private fEngine 	: GuidoEngine = null;
	private fMusicxml 	: libmusicxml = null;
	private fParser : GuidoParser = null;
	private fAR 	: ARHandler = null;
	private fGR 	: GRHandler = null;
	private fPRoll  : GuidoPRoll = null
	private fSPR    : GuidoSPR = null
	private fCurrentSettings : GuidoLayoutSettings = null;
	private fEditor : GuidoEditor = null;
	private fColor = { r: 0, g: 0, b: 0 };
	private fDrawTime = 0;
	private fPages = new Array<number>();
	private fPagesMode = "all";


	constructor() {
		this.fEngine = new GuidoEngine();
		this.fPRoll  = new GuidoPRoll(this.fEngine);
		this.fSPR    = new GuidoSPR(this.fEngine);

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
	initialise (settings: Settings) {
		this.fEngine.initialise().then (() => {
			var version = this.fEngine.getVersion();
			console.log( "Guido Engine version " + version.str);
			$("#version").html (version.str);
			this.fEngine.start();
			this.fCurrentSettings = this.fEngine.getDefaultLayoutSettings();

			this.fParser = this.fEngine.openParser();
			this.fEditor = new GuidoEditor ("code", this);
			settings.setDefault();
			this.fColor = settings.color;
			this.scanOptions();
			let gmn = localStorage.getItem ("gmn");
			if (!gmn) gmn = this.fEditor.value;
			this.process (gmn);
		});
	}
	
	proll() : GuidoPRoll { return this.fPRoll; }
	spr()   : GuidoSPR 	 { return this.fSPR; }
	
	//------------------------------------------------------------------------
	// the display methods
 	svg (page: number, embed=true) : string	{ return this.fGR ? this.fEngine.gr2SVGColored ( this.fGR, page, this.fColor.r, this.fColor.g, this.fColor.b, embed) : ""; }	


	displayPage( n: number, embed: boolean ) : number {
		n = Math.max (n, 1);
		n = Math.min (n, this.pageCount);
		$('<div class="page well">'+this.svg(n, embed)+'</div>').appendTo('#score');
		return this.fEngine.getOnDrawTime(this.fGR);
	}
	
	displayList( pages: Array<number> ) : void {
		this.fDrawTime = 0;
		$("#score").html("");
		var embed = true;
		pages.forEach( (n) => {
			this.fDrawTime += this.displayPage( n, embed );
			embed = false;
		});
		this.showTime();
	}
	
	displayPages( from: number, to: number ) {
		from = Math.max (from, 1);
		to = Math.min (to, this.pageCount);
		this.fDrawTime = 0;
		$("#score").html("");
		for (var i = from; i <= to; i++) {
			$('<div class="page well">'+this.svg(i)+'</div>').appendTo('#score');
			this.fDrawTime += this.fEngine.getOnDrawTime(this.fGR);
		}
		this.showTime();
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
	ar2gr( ar: ARHandler ) : void {
		if (ar) {
			if (this.fGR) this.fEngine.freeGR (this.fGR);	
			this.fGR = this.fEngine.ar2grSettings ( ar, this.fCurrentSettings);
			this.display ();
 			this.fPRoll.process (ar);
 			this.fSPR.process (ar);
		}
	}

	process(gmn: string) : void {
		if ( !gmn || !gmn.trim()) { 
			this.clear(); 
			return;
		}

		if (this.fAR) this.fEngine.freeAR (this.fAR);	
		this.fAR = this.fEngine.string2AR (this.fParser, gmn);
		if (this.fAR) {
			localStorage.setItem ("gmn", gmn);
			this.ar2gr (this.fAR);
			$("#gmn-error").text ("");
		}
		else {
			var error = this.fEngine.parserGetErrorCode( this.fParser );
			$("#gmn-error").text (error.msg + " line " + error.line + " col " + error.col);
			$("#gmn-error").click ( () => { this.fEditor.select( error.line-1, error.col-1 ) });
		}
	}

	refresh() { this.ar2gr (this.fAR); }
	setDefaultSettings () 	{ 
		this.fCurrentSettings = this.fEngine.getDefaultLayoutSettings(); 
		this.fCurrentSettings.optimalPageFill = 0;
	}

	//------------------------------------------------------------------------
	// scan the current location to detect parameters
	scanOptions() : void	{
		let options = this.scanUrl();
		let preview = false;
		for (let i=0; (i<options.length) && !preview; i++) {
			if ((options[i].option == "mode") && (options[i].value == "preview"))
				preview = true;
		}
		for (let i=0; i<options.length; i++) {
			let option = options[i].option;
			let value = options[i].value;
			switch (option) {
				case "code":
					this.setGmn(atob(value), "");
					break;
				case "src":
					var oReq = new XMLHttpRequest();
					if (preview) oReq.onload = () => { this.setGmn( oReq.responseText, value); $("#fullscreen").click(); };
					else 		 oReq.onload = () => { this.setGmn( oReq.responseText, value); };
					oReq.open("get", value, true);
					oReq.send();
					preview = false;
					break;
				case "s":
					console.log ("editor s option value " + value );

					let iframe = <HTMLIFrameElement>document.getElementById("lxmlcom");
					iframe.src = "https://libmusicxml.grame.fr/code/?s=" + value;
					// iframe.src = "http://localhost:8080/code/?s=" + value;
					iframe.onload = () => { 
					let content = iframe.contentWindow.document.getElementById("code");
					console.log ("editor frame content " + content ); };

					// var oReq = new XMLHttpRequest();
					// if (preview) oReq.onload = () => { this.setGmn( oReq.responseText, value); $("#fullscreen").click(); };
					// else 		 oReq.onload = () => { this.setGmn( oReq.responseText, value); };
					// oReq.open("get", "http://localhost:8080/code/?s=" + value, true);
					// oReq.withCredentials = true;
					// oReq.setRequestHeader("Access-Control-Allow-Origin", "*");
					// oReq.setRequestHeader("Content-Type", "text/plain");
					// oReq.send();
					preview = false;
					break;

					// let gmn = localStorage.getItem(value);
					// if (gmn) {
					// 	this.setGmn(gmn, "");
					// }
					// else {
					// 	console.log ("Can't retrieve data from session." + value + " '" + gmn + "' :" + Storage.length);
					// 	alert ("Error:\ncan't retrieve data from session.");
					// }
					// break;
			}
		}
		if (preview)
			$("#fullscreen").click();
	}

	//------------------------------------------------------------------------
	// scan the current location to detect parameters
	scanUrl() : Array<UrlOption>	{
		let result = new Array<UrlOption>();
		let arg = window.location.search.substring(1);
		let n = arg.indexOf("=");
		while (n > 0) {
			let option  = arg.substr(0,n);
			let remain = arg.substr(n+1);
			let next = remain.indexOf("?");
			if (next > 0) {
				let value = remain.substr(0,next);
				result.push ( {option: option, value: value} );
				arg = remain.substr(next + 1);
				n = arg.indexOf("=");
			}
			else {
				result.push ( {option: option, value: remain} );
				break;
			}
		}
		return result;
	}

	//------------------------------------------------------------------------
	// show all pages
	showAll () 					{ this.fPagesMode = "all"; this.display(); }
	// show the last page only
	showLast () 				{ this.fPagesMode = "last"; this.display(); }
	// show a list of pages
	showPages (pages: Array<number>) 	{ this.fPagesMode = "pages"; this.fPages=pages; this.display(); }
	// show or hide score elements
	showElement ( elt: number, status: boolean) : void { 
		if (this.fGR) {
			this.fEngine.showElement (this.fGR, elt, status);
			this.display ();
		}
	}

	//------------------------------------------------------------------------
	// show processing times
	showTime() {
		var ptime = this.fEngine.getParsingTime(this.fAR);
		var ctime = this.fEngine.getAR2GRTime(this.fGR);
		$("#ptime").html(ptime.toString());
		$("#agtime").html(ctime.toString());
		$("#dtime").html(this.fDrawTime.toString());
		$("#ttime").html((ptime + ctime + this.fDrawTime).toString());
	}


	clear () {
		if (this.fAR) this.fEngine.freeAR (this.fAR);	
		if (this.fGR) this.fEngine.freeGR (this.fGR);	
		this.fAR = 0;
		this.fGR = 0;
		this.fPRoll.clear ();
		this.fSPR.clear ();
		$("#gmn-name").text ("");
		$("#score").html("");
		$("#spr").html("");
		$("#gmn-error").text ("");
	}

	setGmn (code: string, path: string) : void	{ this.fEditor.setGmn (code, path) };
	
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
	get settings() : GuidoLayoutSettings			{ return this.fCurrentSettings; }

	get filename () : string { 
		var str = $("#gmn-name").text();
		if (!str || !str.trim()) return "untitled";
		str = str.replace(/.*\//, "");
		return str.replace(/\.gmn$/, "");
	}

	get html () : string { 
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
	set color( c: rgbColor) { 
		this.fColor = c;
		this.display ();
	};

}

