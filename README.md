# Guido Editor Web

The [Guido Editor Web](https://grame-cncm.github.io/guidoeditorweb/) is based on the [Guido library](http://guidolib.sf.net/), is a portable library and API for the graphical rendering of musical scores.


## Features

The Guido online editor generates various music representations from a textual music description in Guido Music Notation [GMN] format. It supports:

- Symbolic music score generation from Guido Music Notation language
- Piano roll representations
- Simplified proportional representations

## Output

Each of the graphic representation can be saved as:

- a standalone SVG file  (embedding the required Guido font)
- a standalone HTML file 



## Building

Firstly ensure that you have [Git](https://git-scm.com/downloads) and [Node.js](https://nodejs.org/) installed.

Clone a copy of the repo then change to the directory:

~~~~~~
git clone https://github.com/grame-cncm/guidoeditorweb.git
cd guidoeditorweb
~~~~~~

Install dev dependencies:
~~~~~~
npm install
~~~~~~

To build everything (actually `dist/example.json`): 
~~~~~~
npm run build
~~~~~~

To test, put the directory in a local server, then open page: `index-dev.html`

Note that you can disable CORS security on Firefox and test without server: go to the `about:config` page and set  `security.fileuri.strict_origin_policy` to false.



When ready to distribute run
~~~~~~
npm run dist
~~~~~~
On output, the `dist` folder contains everything you need to run the Guido editor.
