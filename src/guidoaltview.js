
"use strict";

//----------------------------------------------------------------------------
// Base class for alternate representations
//----------------------------------------------------------------------------
class GuidoAltView {
	constructor(engine, divname, deleteFunction, createFunction) {
		this.fEngine = engine;
		this.fID = 0;
		this.fDelete  = deleteFunction;
		this.fProcess = createFunction;
		this.fDiv = divname;
		this.fBars = false;
		this.fColors = false;
		this.fLines = false;
	}

 	get svg () 	{ return this.fID ? this.fEngine.svgExport (this.fID, 1024, 512) : ""; }	
 	get html () { 
 		var str = '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html;charset=utf-8"></head>\n';
		str += '<style>\ndiv { margin: 20px; padding: 30px; background-color: #efefef; border-radius: 10px; }\n</style>\n'; 
		str += '<body><div>\n';
		str +=  $(this.fDiv).html();
		str += '</div></body></html>\n';
		return str;
	}	

	set id(val) 			{ this.fID = val; }
	showBars( state )	{ this.fBars = state; 	this.display(); }
	showColors( state )	{ this.fColors = state; this.display(); }
	hideLines( state )	{ this.fLines = state; 	this.display(); }

	setupEngine () {
		this.fEngine.enableMeasureBars (this.fID, this.fBars);
		this.fEngine.enableAutoVoicesColoration (this.fID, this.fColors);
	}

	display() {
		if (this.fID) {
			this.setupEngine ();
	 		$(this.fDiv).html(this.svg);	
 		}
	}

	process(ar) {
		this.destroy();
		this.id = this.fProcess (ar);
 		this.display();	
	}

	destroy () {
		if (this.fID) this.fDelete (this.fID);
		this.fID = 0;
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
	constructor (engine) {
		super (engine, "#proll", 
			(id) => engine.destroyPianoRoll (id),
			(ar) => engine.ar2PianoRoll (0, ar)
		);
		this.fKbd = false;
	}

	showKbd( state )	{ this.fKbd = state; 	this.display(); }

	setupEngine () {
		this.fEngine.enableKeyboard (this.fID, this.fKbd);
		this.fEngine.setPitchLinesDisplayMode (this.fID, this.fLines ? -1 : 0);
		super.setupEngine();
	}
}

//----------------------------------------------------------------------------
// Simplified proportional representation
//----------------------------------------------------------------------------
class GuidoSPR extends GuidoAltView  {
	constructor (engine) {
		super (engine, "#spr", 
			(id) => engine.destroyRProportional (id),
			(ar) => engine.ar2RProportional (ar)
		);
		this.fLines = true;
	}

	setupEngine () {
		this.fEngine.drawDurationLines (this.fID, this.fLines);
		super.setupEngine();
	}
}

