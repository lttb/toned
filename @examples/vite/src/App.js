"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@toned/react/config.19");
require("@toned/themes/shadcn/config.css");
require("./index.css");
var base_1 = require("@toned/systems/base");
var react_1 = require("react");
// Works also with SSR as expected
var Card = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./Card'); }); });
function App() {
    return (<main>
      <h1 {...(0, base_1.t)({ typo: 'heading_1' })}>Vite + React</h1>

      <react_1.Suspense fallback={<p>Loading card component...</p>}>
        <Card />
      </react_1.Suspense>
    </main>);
}
exports.default = App;
