"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
require("@toned/react/config.19");
var renderer_1 = require("@react-pdf/renderer");
var core_1 = require("@toned/core");
var ctx_native_1 = require("@toned/react/ctx.native");
var config_1 = require("@toned/themes/shadcn/config");
var Card_1 = require("./Card");
var ctx = (0, ctx_native_1.defineContext)(config_1.default);
(0, core_1.setConfig)({
    getTokens: function () {
        return ctx;
    },
});
var Main = function () {
    return (<renderer_1.Document>
      <renderer_1.Page size="A4">
        <Card_1.default />
      </renderer_1.Page>
    </renderer_1.Document>);
};
function App() {
    return <Main />;
}
