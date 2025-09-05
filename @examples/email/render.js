"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bun_1 = require("bun");
var server_1 = require("react-dom/server");
var App_tsx_1 = require("./App.tsx");
var stream = (0, server_1.renderToString)(<App_tsx_1.default />);
await (0, bun_1.write)("".concat(__dirname, "/example.html"), stream);
