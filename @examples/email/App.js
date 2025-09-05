"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
var components_1 = require("@react-email/components");
var core_1 = require("@toned/core");
var ctx_native_1 = require("@toned/react/ctx.native");
var config_1 = require("@toned/themes/shadcn/config");
var react_1 = require("react");
var Card_1 = require("./Card");
var ctx = (0, ctx_native_1.defineContext)(config_1.default);
(0, core_1.setConfig)({
    getTokens: function () {
        return (0, react_1.use)(ctx_native_1.TokensContext);
    },
});
var Main = function () {
    return (<ctx_native_1.TokensContext.Provider value={ctx}>
      <components_1.Html>
        <components_1.Body>
          <Card_1.default />
        </components_1.Body>
      </components_1.Html>
    </ctx_native_1.TokensContext.Provider>);
};
function App() {
    return <Main />;
}
