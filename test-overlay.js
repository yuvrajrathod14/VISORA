import fs from 'fs';
import { JSDOM } from 'jsdom';

const overlayCode = fs.readFileSync('packages/vite-plugin/dist/overlay.js', 'utf-8');

const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
const window = dom.window;
const document = window.document;

// Mock some globals
global.window = window;
global.document = document;
global.HTMLElement = window.HTMLElement;
global.Element = window.Element;
global.MouseEvent = window.MouseEvent;
global.KeyboardEvent = window.KeyboardEvent;

try {
  eval(overlayCode);
  console.log("Overlay executed successfully without runtime syntax errors!");
  console.log("Body children:", document.body.innerHTML);
} catch (e) {
  console.error("OVERLAY EXECUTION ERROR:");
  console.error(e);
}
