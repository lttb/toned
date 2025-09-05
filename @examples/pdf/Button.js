"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = Button;
var button_1 = require("@examples/shared/button");
var renderer_1 = require("@react-pdf/renderer");
var react_1 = require("@toned/react");
function Button(_a) {
    var label = _a.label;
    var s = (0, react_1.useStyles)(button_1.styles, {
        size: 'm',
        variant: 'accent',
    });
    return (<renderer_1.View {...s.container} style={__assign(__assign({}, s.container.style), { borderWidth: 0.00005 })}>
      <renderer_1.Text {...s.label}>{label}</renderer_1.Text>
    </renderer_1.View>);
}
