"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var card_1 = require("@examples/shared/card");
var react_1 = require("@toned/react");
var base_1 = require("@toned/systems/base");
var Button_1 = require("./Button");
function Card() {
    var s = (0, react_1.useStyles)(card_1.styles);
    return (<div {...s.container}>
      <Button_1.Button label={String(Math.random())}/>

      <span {...(0, base_1.t)({ textColor: 'status_info' })}>
        Edit <span {...s.code}>src/App.tsx</span> and save to test HMR
      </span>
    </div>);
}
exports.default = Card;
