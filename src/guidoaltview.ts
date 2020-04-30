
///<reference path="lib/guidoengine.ts"/>

//----------------------------------------------------------------------------
// Base class for alternate representations
//----------------------------------------------------------------------------
abstract class GuidoAltView {

	private fDiv: string;

	protected fBars = false;
	protected fColors = false;
	protected fEngine : GuidoEngine;
	protected fLines = false;

	constructor(engine : GuidoEngine, divname: string) {
		this.fEngine = engine;
		this.fDiv = divname;
	}

	abstract create (ar: ARHandler) : void;
	abstract destroy() : void;
	abstract handler() : PianoRoll | ReducedProportional;
	abstract setupEngine () : void;
	abstract getsvg () : string;
 
	get svg () 	{ return this.getsvg(); }	
	get html () : string { 
 		var str = '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html;charset=utf-8"></head>\n';
		str += '<style>\ndiv { margin: 20px; padding: 30px; background-color: #efefef; border-radius: 10px; }\n</style>\n'; 
		str += '<body><div>\n';
		str +=  $(this.fDiv).html();
		str += '</div></body></html>\n';
		return str;
	}	

	showBars  ( state: boolean )	{ this.fBars = state; 	this.display(); }
	showColors( state: boolean )	{ this.fColors = state; this.display(); }
	hideLines ( state: boolean )	{ this.fLines = state; 	this.display(); }

	display() {
		if (this.handler()) {
			this.setupEngine ();
	 		$(this.fDiv).html(this.svg);	
 		}
	}

	process(ar: ARHandler) : void {
		this.create (ar);
 		this.display();	
	}

	clear () {
		this.destroy();
		$(this.fDiv).html("");
	}
}


//----------------------------------------------------------------------------
// Piano roll representation
//----------------------------------------------------------------------------
class GuidoPRoll extends GuidoAltView {
	
	private fKbd = false;
	private fPRoll : PianoRoll = null;

	constructor (engine: GuidoEngine) {
		super (engine, "#proll");
	}

	showKbd( state: boolean ) : void	{ this.fKbd = state; 	this.display(); }

	handler() : PianoRoll 	{ return this.fPRoll; }
	getsvg () : string 	{ return this.fPRoll ? this.fEngine.pianoRoll().svgExport (this.fPRoll, 1024, 512) : ""; }	

	create (ar: ARHandler) { 
		this.destroy();
		this.fPRoll = this.fEngine.ar2PianoRoll (0, ar);
	}

	destroy() {
		if (this.fPRoll) {
			this.fEngine.pianoRoll().destroyPianoRoll (this. fPRoll);
			this.fPRoll = null;
		}
	}

	setupEngine () {
		this.fEngine.pianoRoll().enableKeyboard (this.fPRoll, this.fKbd);
		this.fEngine.pianoRoll().setPitchLinesDisplayMode (this.fPRoll, this.fLines ? -1 : 0);
		this.fEngine.pianoRoll().enableMeasureBars (this.fPRoll, this.fBars);
		this.fEngine.pianoRoll().enableAutoVoicesColoration (this.fPRoll, this.fColors);
	}
}

//----------------------------------------------------------------------------
// Simplified proportional representation
//----------------------------------------------------------------------------
class GuidoSPR extends GuidoAltView  {

	private fSPR : ReducedProportional = null;

	constructor (engine: GuidoEngine) {
		super (engine, "#spr");
		this.fLines = true;
	}

	handler() : ReducedProportional 	{ return this.fSPR; }
	getsvg () : string 	{ return this.fSPR ? this.fEngine.reducedProp().svgExport (this.fSPR, 1024, 512) : ""; }	

	create (ar: ARHandler) { 
		this.destroy();
		this.fSPR = this.fEngine.reducedProp().ar2RProportional (ar);
	}

	destroy() {
		if (this.fSPR) {
			this.fEngine.reducedProp().destroyRProportional (this. fSPR);
			this.fSPR = null;
		}
	}

	setupEngine () {
		this.fEngine.reducedProp().drawDurationLines (this.fSPR, this.fLines);
		this.fEngine.reducedProp().enableMeasureBars (this.fSPR, this.fBars);
		this.fEngine.reducedProp().enableAutoVoicesColoration (this.fSPR, this.fColors);
	}
}

