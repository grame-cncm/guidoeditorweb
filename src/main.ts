
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

window.addEventListener('message', event => {
console.log ("message received from " + event.origin);
	// IMPORTANT: check the origin of the data! 
    if (event.origin.startsWith('https://libmusicxml.grame.fr')) { 
        // The data was sent from your site.
        // Data sent with postMessage is stored in event.data:
        console.log(event.data); 
    } else {
        // The data was NOT sent from your site! 
        // Be careful! Do not use it. This else branch is
        // here just for clarity, you usually shouldn't need it.
        return; 
    } 
});

document.domain = "grame.fr";
