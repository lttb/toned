"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = Button;
var button_1 = require("@examples/shared/button");
var react_1 = require("@toned/react");
var react_native_1 = require("react-native");
function Button(_a) {
    var label = _a.label;
    var s = (0, react_1.useStyles)(button_1.styles, {
        size: 'm',
        variant: 'accent',
    });
    return (<react_native_1.Pressable role="button" {...s.container}>
      <react_native_1.Text {...s.label}>{label}</react_native_1.Text>
    </react_native_1.Pressable>);
}
