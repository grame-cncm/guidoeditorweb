
// Append each file in examples.json to div menu
fetch("./examples.json")
	.then(response => response.json())
	.then((tree) => {
		const $menu = $("#tab-examples");
		const parseTree = (treeIn, $menu) => {
			if (treeIn.type === "file") {
				const $item = $("<a>").attr("href", "#").text(treeIn.name).data("path", treeIn.path);
				$menu.append($("<li>").append($item));
				$item.on("click", (e) => { load(treeIn.name, treeIn.path); } )

			} else {
				const $item = $("<li>").addClass(["dropdown-submenu"]);
				const $a = $("<a>").attr("href", "#").text(treeIn.name).on("click", (e) => { e.stopImmediatePropagation(); } );
				const $submenu = $("<ul>").addClass("dropdown-menu");
				$item.append($a, $submenu);
				treeIn.children.forEach(v => parseTree(v, $submenu));
				$menu.append($item);
				$a.dropdown();
			}
		};
		if (tree.children) tree.children.forEach(v => parseTree(v, $menu));
});


function load (name, path) {
	if (path) {
	fetch("./" + path)
		.then(response => response.text())
		.then((code) => {
			guidoEditor.setGmn (code, path);
		});
	}
}
