# Guido Editor Web


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

To build everything (using Webpack 4, Babel 7, TypeScript), this will produce `dist/index.js`
~~~~~~
npm run build
~~~~~~

To test, put the directory in a local server, then open page: `index-dev.html`



When ready to distribute run
~~~~~~
npm run dist
~~~~~~
On output, the `dist` folder contains everything you need to run the Guido editor.
