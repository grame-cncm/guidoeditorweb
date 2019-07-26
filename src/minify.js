var fs = require('fs');
var uglify = require("uglify-js");

var uglified = uglify.minify(['examples.js', 'guido.js', 'engine-settings.js', 'guidoeditor.js']);

fs.writeFile('index.min.js', uglified.code, function (err){
  if(err) {
    console.log(err);
  } else {
    console.log("Script generated and saved:", 'concat.min.js');
  }      
});
