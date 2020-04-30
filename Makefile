
MAKE ?= make

CM := lib/codemirror.css theme/abcdef.css theme/ambiance.css theme/bespin.css theme/blackboard.css theme/cobalt.css theme/colorforth.css theme/dracula.css theme/duotone-dark.css theme/duotone-light.css theme/eclipse.css theme/elegant.css theme/erlang-dark.css theme/hopscotch.css theme/icecoder.css theme/isotope.css theme/lesser-dark.css theme/liquibyte.css theme/material.css theme/mbo.css theme/mdn-like.css theme/midnight.css theme/monokai.css theme/neat.css theme/neo.css theme/night.css theme/panda-syntax.css theme/paraiso-dark.css theme/paraiso-light.css theme/pastel-on-dark.css theme/railscasts.css theme/rubyblue.css theme/seti.css theme/solarized.css theme/the-matrix.css theme/tomorrow-night-bright.css theme/tomorrow-night-eighties.css theme/ttcn.css theme/twilight.css theme/vibrant-ink.css theme/xq-dark.css theme/xq-light.css theme/yeti.css theme/zenburn.css

DIST := docs
FONTDIR := $(DIST)/font
CSSDIR  := $(DIST)/css
TSFOLDER := src
TSLIB	 := $(TSFOLDER)/lib
GUIDOTS := guidoengine.ts libGUIDOEngine.d.ts
LXMLTS  := libmusicxml.ts libmusicxml.d.ts
TSFILES := $(GUIDOTS:%=$(TSLIB)/%) $(LXMLTS:%=$(TSLIB)/%)

CSS := editor.css settings.css prefs.css

CMFILES  := $(CM:%=node_modules/codemirror/%)
CSSFILES := $(CSS:%=css/%)
EXTFILES := node_modules/jquery/dist/jquery.js node_modules/bootstrap/dist/js/bootstrap.js node_modules/codemirror/lib/codemirror.js
LIBOUT   := extern.min.js
CSSOUT   := guidoeditor.min.css codemirror.min.css bootstrap.min.css
OUT      := $(LIBOUT:%=$(DIST)/lib/%) $(CSSOUT:%=$(DIST)/css/%)
GUIDOLIB := $(DIST)/lib/libGUIDOEngine.js
LXMLLIB  := $(DIST)/lib/libmusicxml.js
GUIDONODE:= node_modules/@grame/guidolib
LXMLNODE := node_modules/@grame/libmusicxml

.PHONY: examples

all: $(DIST) $(OUT) $(GUIDOLIB)
	$(MAKE) examples
	$(MAKE) ts
	$(MAKE) libs
	$(MAKE) font
	$(MAKE) css
	$(MAKE) minify
	$(MAKE) readme
	git checkout $(DIST)/CNAME


###########################################################################
help:
	@echo "============================================================"
	@echo "                   Guido Online Editor"
	@echo "============================================================"
	@echo "Available targets are:"
	@echo "  all (default): generates the site into $(DIST)"
	@echo "  clean        : remove the minified files"
	@echo "========== Development targets"
	@echo "  ts           : build the typescript version"
	@echo "  tslibs       : update $(TSLIB) folder from nodes_modules"
	@echo "  examples     : scan the $(DIST)/examples folder to generate the examples.json file"
	@echo "========== Deployment targets"
	@echo "  libs         : update wasm libs in $(DIST)/lib folder from nodes_modules and minify external libs"
	@echo "  font         : copy the guidofonts in $(DIST)/font from guido nodes module"
	@echo "  minify       : generates the minified files (js and css)"
	@echo "  readme       : generates README.html from README.md"
	@echo "============================================================"


###########################################################################
ts : $(TSLIB) $(DIST)/guidoeditor.js

$(DIST)/guidoeditor.js : $(TSFILES)
	cd $(TSFOLDER) && tsc

tslibs:
	cp $(GUIDONODE)/libGUIDOEngine.d.ts $(TSLIB)
	cp $(GUIDONODE)/guidoengine.ts $(TSLIB)
	cp $(LXMLNODE)/libmusicxml.ts $(TSLIB)
	cp $(LXMLNODE)/libmusicxml.d.ts $(TSLIB)

libs: $(DIST)/lib $(DIST)/lib/extern.min.js
	cp $(GUIDONODE)/libGUIDOEngine.js 	$(DIST)/lib
	cp $(GUIDONODE)/libGUIDOEngine.wasm $(DIST)/lib
	cp $(LXMLNODE)/libmusicxml.js 		$(DIST)/lib
	cp $(LXMLNODE)/libmusicxml.wasm 	$(DIST)/lib

$(TSLIB):
	mkdir $(TSLIB)

$(DIST)/lib:
	mkdir $(DIST)/lib

test:
	@echo $(TSFILES)

minify:  $(OUT) $(GUIDOLIB) $(LXMLLIB) $(DIST)/guidoeditor.min.js

font:  $(FONTDIR)
	cp $(GUIDONODE)/guido2-webfont/guido2-webfont.woff* $(FONTDIR)
	cp $(GUIDONODE)/guido2-webfont/stylesheet.css $(FONTDIR)
	
css: $(CSSDIR)/guidoeditor.min.css $(CSSDIR)/guidoeditor.min.css $(CSSDIR)/codemirror.min.css
	cp node_modules/bootstrap/dist/css/bootstrap.min.css* $(DIST)/css/ 


$(FONTDIR):
	mkdir $(FONTDIR)

readme:
	$(MAKE) README.html

README.html : README.md
	echo "<!DOCTYPE html><html><xmp>" > README.html
	cat README.md  >> README.html
	echo "</xmp> <script src=http://strapdownjs.com/v/0.2/strapdown.js></script> </html>"  >> README.html

examples:
	cd $(DIST) && node ../scripts/listEx.js

###########################################################################
$(DIST)/lib/extern.min.js : $(EXTFILES)
	node node_modules/.bin/minify $(EXTFILES) > $@ || (rm $@ ; false)

$(DIST)/guidoeditor.min.js : $(DIST)/guidoeditor.js
	node node_modules/.bin/minify $< > $@ || (rm $@ ; false)

$(CSSDIR)/guidoeditor.min.css : $(CSSFILES)
	node node_modules/.bin/minify $(CSSFILES) > $@ || (rm $@ ; false)

$(CSSDIR)/codemirror.min.css : $(CMFILES)
	node node_modules/.bin/minify $(CMFILES) > $@ || (rm $@s ; false)

	
clean :
	rm $(OUT)
