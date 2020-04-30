
///<reference path="lib/libmusicxml.ts"/>
///<reference path="guidocompiler.ts"/>
///<reference path="guidosettings.ts"/>



//------------------------------------------------------------------------
const guidoCompiler = new GuidoCompiler();
const settings = new GuidoSettings (guidoCompiler);
guidoCompiler.initialise (settings);


//------------------------------------------------------------------------
function xmlversion (lxml: libMusicXMLAdapter) : void {
	console.log( "LibMusicXML version " + lxml.libVersionStr());
	$("#lxmlversion").html (lxml.libVersionStr());
	console.log( "MusicXML to GMN converter version " + lxml.musicxml2guidoVersionStr());
	$("#xml2guidoversion").html (lxml.musicxml2guidoVersionStr());
}
const lxml = new libmusicxml();
lxml.initialise ().then ( xmlversion );

