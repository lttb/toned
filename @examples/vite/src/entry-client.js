"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var client_1 = require("react-dom/client");
var App_1 = require("./App");
(0, client_1.hydrateRoot)(document.getElementById('root'), <react_1.StrictMode>
    <App_1.default />
  </react_1.StrictMode>);
