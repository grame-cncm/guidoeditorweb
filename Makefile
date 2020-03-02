
MAKE ?= make

CM := lib/codemirror.css theme/abcdef.css theme/ambiance.css theme/bespin.css theme/blackboard.css theme/cobalt.css theme/colorforth.css theme/dracula.css theme/duotone-dark.css theme/duotone-light.css theme/eclipse.css theme/elegant.css theme/erlang-dark.css theme/hopscotch.css theme/icecoder.css theme/isotope.css theme/lesser-dark.css theme/liquibyte.css theme/material.css theme/mbo.css theme/mdn-like.css theme/midnight.css theme/monokai.css theme/neat.css theme/neo.css theme/night.css theme/panda-syntax.css theme/paraiso-dark.css theme/paraiso-light.css theme/pastel-on-dark.css theme/railscasts.css theme/rubyblue.css theme/seti.css theme/solarized.css theme/the-matrix.css theme/tomorrow-night-bright.css theme/tomorrow-night-eighties.css theme/ttcn.css theme/twilight.css theme/vibrant-ink.css theme/xq-dark.css theme/xq-light.css theme/yeti.css theme/zenburn.css

DIST := dist

SRC :=  lxmlinterface.js examples.js guido.js engine-settings.js guidoeditor.js guidoaltview.js guidocompiler.js
CSS := editor.css settings.css prefs.css

CMFILES  := $(CM:%=node_modules/codemirror/%)
JSFILES  := $(SRC:%=src/%)
CSSFILES := $(CSS:%=css/%)
EXTFILES := node_modules/jquery/dist/jquery.js node_modules/bootstrap/dist/js/bootstrap.js node_modules/codemirror/lib/codemirror.js
LIBOUT   := index.min.js extern.min.js
CSSOUT   := guidoeditor.min.css codemirror.min.css bootstrap.min.css
OUT      := $(LIBOUT:%=$(DIST)/lib/%) $(CSSOUT:%=$(DIST)/css/%)
GUIDOLIB := $(DIST)/lib/libGUIDOEngine.js
LXMLLIB  := $(DIST)/lib/libmusicxml.js
GUIDONODE:= node_modules/@grame/guidolib
LXMLNODE := node_modules/@grame/libmusicxml

.PHONY: examples

all: $(DIST) $(OUT) $(GUIDOLIB)
	$(MAKE) examples

$(DIST):
	mkdir $(DIST)


###########################################################################
help:
	@echo "============================================================"
	@echo "                   Guido Online Editor"
	@echo "============================================================"
	@echo "Available targets are:"
	@echo "  all (default): generates the site into $(DIST)"
	@echo "  minify       : generates the minified files (js and css)"
	@echo "  readme       : generates README.html from README.md"
	@echo "  examples     : scan the $(DIST)/examples folder to generate the examples.json file"
	@echo "  guidolib     : update the libGUIDOEngine from the npm package"
	@echo "  libmusicxml  : update the libmusicxml lib from the npm package"
	@echo "  clean        : remove the minified files"


minify:  $(OUT) $(GUIDOLIB) $(LXMLLIB) README.html

readme:
	$(MAKE) README.html

README.html : README.md
	echo "<!DOCTYPE html><html><xmp>" > README.html
	cat README.md  >> README.html
	echo "</xmp> <script src=http://strapdownjs.com/v/0.2/strapdown.js></script> </html>"  >> README.html


guidolib:
	cp $(GUIDONODE)/libGUIDOEngine.js  $(DIST)/lib/
	cp $(GUIDONODE)/libGUIDOEngine.wasm  $(DIST)/lib/
	
libmusicxml:
	cp $(LXMLNODE)/libmusicxml.js  $(DIST)/lib/
	cp $(LXMLNODE)/libmusicxml.wasm  $(DIST)/lib/
	cp $(LXMLNODE)/interface.js  src/lxmlinterface.js
	
$(DIST)/lib/extern.min.js : $(EXTFILES)
	node node_modules/.bin/minify $(EXTFILES) > $@ || (rm $@ ; false)

$(DIST)/lib/index.min.js : $(JSFILES)
	node node_modules/.bin/minify $(JSFILES) > $@ || (rm $@ ; false)

$(DIST)/css/guidoeditor.min.css : $(CSSFILES)
	node node_modules/.bin/minify $(CSSFILES) > $@ || (rm $@ ; false)

$(DIST)/css/codemirror.min.css : $(CMFILES)
	node node_modules/.bin/minify $(CMFILES) > $@ || (rm $@s ; false)

$(DIST)/css/bootstrap.min.css : node_modules/bootstrap/dist/css/bootstrap.min.css
	cp node_modules/bootstrap/dist/css/bootstrap.min.css* dist/css/ 


examples:
	cd $(DIST) && node ../src/listEx.js

	
clean :
	rm $(OUT)

test:
	@echo $(JSFILES) $(CSSFILES)