
"use strict";


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
		var ext = path.substr(path.lastIndexOf('.') + 1);
		if (ext === "xml") {
			gmn = lxml.string2guido (gmn, true);
		}
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


