"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = Button;
var button_1 = require("@examples/shared/button");
var components_1 = require("@react-email/components");
var react_1 = require("@toned/react");
function Button(_a) {
    var label = _a.label;
    var s = (0, react_1.useStyles)(button_1.styles, {
        size: 'm',
        variant: 'accent',
    });
    return (<components_1.Link {...s.container}>
      <span {...s.label}>{label}</span>
    </components_1.Link>);
}
