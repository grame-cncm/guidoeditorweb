
CM := lib/codemirror.css theme/abcdef.css theme/ambiance.css theme/bespin.css theme/blackboard.css theme/cobalt.css theme/colorforth.css theme/dracula.css theme/duotone-dark.css theme/duotone-light.css theme/eclipse.css theme/elegant.css theme/erlang-dark.css theme/hopscotch.css theme/icecoder.css theme/isotope.css theme/lesser-dark.css theme/liquibyte.css theme/material.css theme/mbo.css theme/mdn-like.css theme/midnight.css theme/monokai.css theme/neat.css theme/neo.css theme/night.css theme/panda-syntax.css theme/paraiso-dark.css theme/paraiso-light.css theme/pastel-on-dark.css theme/railscasts.css theme/rubyblue.css theme/seti.css theme/solarized.css theme/the-matrix.css theme/tomorrow-night-bright.css theme/tomorrow-night-eighties.css theme/ttcn.css theme/twilight.css theme/vibrant-ink.css theme/xq-dark.css theme/xq-light.css theme/yeti.css theme/zenburn.css

SRC := examples.js guido.js engine-settings.js guidoeditor.js
CSS := editor.css settings.css prefs.css

CMFILES  := $(CM:%=node_modules/codemirror/%)
JSFILES  := $(SRC:%=src/%)
CSSFILES := $(CSS:%=css/%)
EXTFILES := node_modules/jquery/dist/jquery.js node_modules/bootstrap/dist/js/bootstrap.js node_modules/codemirror/lib/codemirror.js
LIBOUT   := index.min.js extern.min.js
CSSOUT   := guidoeditor.min.css codemirror.min.css bootstrap.min.css print.css
OUT      := $(LIBOUT:%=dist/lib/%) $(CSSOUT:%=dist/css/%)

all:  $(OUT) 

dist/lib/extern.min.js : $(EXTFILES)
	node node_modules/.bin/minify $(EXTFILES) > $@ || (rm $@ ; false)

dist/lib/index.min.js : $(JSFILES)
	node node_modules/.bin/minify $(JSFILES) > $@ || (rm $@ ; false)

dist/css/guidoeditor.min.css : $(CSSFILES)
	node node_modules/.bin/minify $(CSSFILES) > $@ || (rm $@ ; false)

dist/css/codemirror.min.css : $(CMFILES)
	node node_modules/.bin/minify $(CMFILES) > $@ || (rm $@s ; false)

dist/css/bootstrap.min.css : node_modules/bootstrap/dist/css/bootstrap.min.css
	cp $<  $@ 

dist/css/print.css : css/print.css
	cp $<  $@ 

	
clean :
	rm $(OUT)

test:
	@echo $(JSFILES) $(CSSFILES)