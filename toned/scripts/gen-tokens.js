#!/usr/bin/env bun
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_assert_1 = require("node:assert");
var path = require("node:path");
var node_util_1 = require("node:util");
var _a = (0, node_util_1.parseArgs)({
    strict: true,
    allowPositionals: true,
}), values = _a.values, positionals = _a.positionals;
var filepath = positionals[0], output = positionals[1];
(0, node_assert_1.default)(filepath && output, 'filepath and output are requried');
var tokens = (await Promise.resolve("".concat(path.join(process.cwd(), filepath))).then(function (s) { return require(s); }));
await Bun.write(path.resolve(process.cwd(), output), ":root {\n".concat(Object.entries(tokens.default)
    .map(function (_a) {
    var key = _a[0], value = _a[1];
    return "--".concat(key, ": ").concat(value);
})
    .join(';\n'), "\n}"), { createPath: true });
