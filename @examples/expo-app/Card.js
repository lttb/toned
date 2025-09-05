"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var card_1 = require("@examples/shared/card");
var index_1 = require("@toned/react/index");
var base_1 = require("@toned/systems/base");
var react_native_1 = require("react-native");
var Button_1 = require("./Button");
function Card() {
    var s = (0, index_1.useStyles)(card_1.styles);
    return (<react_native_1.View {...s.container}>
      <Button_1.Button label={String(Math.random())}/>

      <react_native_1.Text {...(0, base_1.t)({ textColor: 'status_info' })}>
        Edit <react_native_1.Text {...s.code}>src/App.tsx</react_native_1.Text> and save to test HMR
      </react_native_1.Text>
    </react_native_1.View>);
}
exports.default = Card;
