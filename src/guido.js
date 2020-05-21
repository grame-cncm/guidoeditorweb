// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../node_modules/codemirror/lib/codemirror"));
  else if (typeof define == "function" && define.amd)
    define(["../node_modules/codemirror/lib/codemirror"], mod);
  else
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("guido", function () {
  var tag_regex = /[a-zA-Z]+/;
  var note_regex = /[abcdefgh]/;
  var solf_regex = /do|re|mi|fa|sol|la|si|cis|dis|fis|ais/;
  

  function tokenize(stream, state) {

    if (stream.match(solf_regex, true))
    if (!state.inComment) return 'def';

    var ch = stream.next();

    if (ch == "%") {
      stream.skipToEnd();
      return 'comment';
    }
    if (ch == "\\") {
     if (stream.match(tag_regex, true))
      return 'keyword';
    }
    if (state.inComment) {
      if (ch == "*") {
         if (stream.peek() == ")") {
			ch = stream.next();
            state.inComment = false;
        }
      }
      return 'comment';
    }
    else if (ch == "(") {
      if (stream.peek() == "*") {
        state.inComment = true;
        return 'comment';
      }
    }

    if (state.inString) {
      if (ch == '"') state.inString = false;
      return "string";
    }
    else if (ch == '"') {
      state.inString = true;
      return "string";
    }

    if (ch.match(note_regex, true))
      return 'def';

    if (ch.match(/[()<>{}]/)) 
      return 'bracket';
    
    if (ch.match(/[0-9]/)) 
      return 'number';
    
    stream.eatWhile(/[\w-]/);
    return null;
  }
  return {
    startState: function () {
      var state = {};
      state.inComment = false;
      state.inString = false;
      return state;
    },
    token: function (stream, state) {
      if (stream.eatSpace()) return null;
      return tokenize(stream, state);
    }
  };
});

CodeMirror.defineMIME("text/gmn", "guido");

});
