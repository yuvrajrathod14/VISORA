const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, {
  runScripts: "dangerously",
  url: "http://localhost:5174"
});
const window = dom.window;
global.window = window;
global.document = window.document;
global.navigator = window.navigator;

const scriptContent = fs.readFileSync('packages/vite-plugin/dist/overlay.js', 'utf-8');

try {
  dom.window.eval(scriptContent);
  console.log("Script evaluated successfully!");
  console.log("Body children:", document.body.innerHTML);
} catch (e) {
  console.error("Runtime error in overlay.js:", e);
}
