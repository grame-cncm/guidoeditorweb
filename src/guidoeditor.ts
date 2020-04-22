

interface Compiler { process (gmn: string) : void }

//----------------------------------------------------------------------------
// this is the editor part, currently using CodeMirror
//----------------------------------------------------------------------------
class GuidoEditor {

	private fEditor: CodeMirror.EditorFromTextArea;

	constructor (divID: string, compiler: GuidoCompiler) {
		this.fEditor = CodeMirror.fromTextArea (<HTMLTextAreaElement>document.getElementById (divID), {
			lineNumbers: true,
			mode: 'guido',
			theme: 'default',
			smartIndent: true,
			tabSize: 4,
			lineWrapping: true,
			indentWithTabs: true
		});
		this.initialize (compiler);
	}
	
	initialize (compiler: Compiler) {
  		this.fEditor.on('change', 		(editor: any) 	=> { compiler.process (this.value); } );
		this.fEditor.on("dragstart",	(editor: any, e: DragEvent) => {});
		this.fEditor.on("dragenter",	(editor: any, e: DragEvent) => { $("#editor").css( "opacity", 0.3 ); });
		this.fEditor.on("dragleave",	(editor: any, e: DragEvent) => { $("#editor").css( "opacity", 1 ); });
		this.fEditor.on("drop",			(editor: any, e: DragEvent) => { 
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
		$("#font-family").change 	( (event) => { this.fEditor.getWrapperElement().style.fontFamily =  <string>$("#font-family").val(); } ); 
		$("#font-size").change 		( (event) => { this.fEditor.getWrapperElement().style.fontSize =  $("#font-size").val() + "px"; } ); 
		$("#etheme").change 		( (event) => { this.fEditor.setOption("theme", <string>$("#etheme").val()); } );
		$("#wraplines").change 		( (event) => { this.fEditor.setOption("lineWrapping",  <boolean>$("#wraplines").is(":checked")); } );

		this.fEditor.getWrapperElement().style.fontFamily =  <string>$("#font-family").val();
		this.fEditor.getWrapperElement().style.fontSize   =  $("#font-size").val() + "px"; 
		this.fEditor.setOption("theme", <string>$("#etheme").val());
		this.fEditor.setOption("lineWrapping",  <boolean>$("#wraplines").is(":checked"));

	}
	
	setGmn( gmn: string, path: string): void {
		$("#gmn-name").text (path);
		var ext = path.substr(path.lastIndexOf('.') + 1).toLowerCase();
		if ((ext === "xml") ||  (ext === "musicxml")) {
			gmn = lxml.string2guido (gmn, true);
		}
		this.fEditor.setValue(gmn);
		this.fEditor.refresh();
	} 

	drop (file: File) {
		let reader = new FileReader();	
		reader.onload = (event) => { this.setGmn (reader.result.toString(), file.name); };
		reader.readAsText(file);
	}
	
	select(line: number, col: number) 	{ this.fEditor.setSelection( {line: line, ch: col-1}, {line: line, ch: col} ) };
	resize(h: number) 			{ $("div.CodeMirror").css("height", h) };
	get value(): string 		{ return this.fEditor.getValue(); }
}


