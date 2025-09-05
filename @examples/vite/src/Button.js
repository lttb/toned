"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = Button;
var button_1 = require("@examples/shared/button");
var index_1 = require("@toned/react/index");
function Button(_a) {
    var label = _a.label;
    var s = (0, index_1.useStyles)(button_1.styles, {
        size: 'm',
        variant: 'accent',
    });
    return (<button type="button" {...s.container}>
      <span {...s.label}>{label}</span>
    </button>);
}
