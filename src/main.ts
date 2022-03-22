
///<reference types="@grame/libmusicxml"/>
///<reference path="guidocompiler.ts"/>
///<reference path="guidosettings.ts"/>


var guidoCompiler : GuidoCompiler;
var settings : GuidoSettings;
var lxml: libMusicXMLAdapter;

//------------------------------------------------------------------------
GuidoModule().then ( (module: any) => {
	guidoCompiler = new GuidoCompiler(module);
	settings = new GuidoSettings (guidoCompiler);
	guidoCompiler.initialise (settings);
});

MusicXMLModule().then (( module: any) => {
    lxml = new module.libMusicXMLAdapter();
    xmlversion(lxml);
});


//------------------------------------------------------------------------
function xmlversion (lxml: libMusicXMLAdapter) : void {
	console.log( "LibMusicXML version ", lxml.libVersionStr());
	$("#lxmlversion").html (lxml.libVersionStr());
	console.log( "MusicXML to GMN converter version " + lxml.musicxml2guidoVersionStr());
	$("#xml2guidoversion").html (lxml.musicxml2guidoVersionStr());
}

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
