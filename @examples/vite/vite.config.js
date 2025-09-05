"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plugin_react_1 = require("@vitejs/plugin-react");
var vite_1 = require("vite");
// https://vite.dev/config/
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)(), cssLinkPlugin()],
});
function cssLinkPlugin() {
    return {
        name: 'vite-css-link',
        transformIndexHtml: function (html, ctx) {
            // Only apply in development
            if (!ctx.server)
                return html;
            // Get all CSS modules from the server
            var cssModules = Array.from(ctx.server.moduleGraph.urlToModuleMap.entries())
                .filter(function (_a) {
                var url = _a[0];
                return url.endsWith('.css');
            })
                .map(function (_a) {
                var url = _a[0];
                return url;
            });
            // Create link tags
            var links = cssModules
                .map(function (css) { return "<link rel=\"stylesheet\" href=\"".concat(css, "\">"); })
                .join('\n');
            return html.replace('</head>', "".concat(links, "</head>"));
        },
    };
}
