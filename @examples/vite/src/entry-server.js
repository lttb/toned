"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = render;
var react_1 = require("react");
var server_1 = require("react-dom/server");
var App = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./App'); }); });
function render(_url, options) {
    return (0, server_1.renderToPipeableStream)(<react_1.StrictMode>
      <App />
    </react_1.StrictMode>, options);
}
