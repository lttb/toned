"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var renderer_1 = require("@react-pdf/renderer");
var App_tsx_1 = require("./App.tsx");
renderer_1.default.render(<App_tsx_1.default />, "".concat(__dirname, "/example.pdf"));
