"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var card_1 = require("@examples/shared/card");
var renderer_1 = require("@react-pdf/renderer");
var react_1 = require("@toned/react");
var base_1 = require("@toned/systems/base");
var Button_1 = require("./Button");
function Card() {
    var s = (0, react_1.useStyles)(card_1.styles);
    return (<renderer_1.View {...s.container}>
      <Button_1.Button label={String(Math.random())}/>

      <renderer_1.Text {...(0, base_1.t)({ textColor: 'status_info' })}>
        Edit <renderer_1.Text {...s.code}>src/App.tsx</renderer_1.Text> and save to test HMR
      </renderer_1.Text>
    </renderer_1.View>);
}
exports.default = Card;
