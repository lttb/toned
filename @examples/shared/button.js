"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = void 0;
var base_1 = require("@toned/systems/base");
exports.styles = (0, base_1.stylesheet)(__assign(__assign({}, (base_1.stylesheet.state)), { container: {
        $$type: 'view',
        borderRadius: 'medium',
        borderWidth: 'none',
        style: {
            cursor: 'pointer',
        },
    }, label: {
        $$type: 'text',
        // style: {
        // 	pointerEvents: 'none',
        // 	userSelect: 'none',
        // },
    }, '[variant=accent]': {
        $container: {
            bgColor: 'action',
            ':hover': {
                bgColor: 'action_secondary',
                $label: {
                    textColor: 'on_action_secondary',
                },
            },
            // control :active precedence over :hover
            ':active': {
                $container: {
                    bgColor: 'destructive',
                },
                $label: {
                    textColor: 'on_destructive',
                },
            },
        },
        $label: {
            textColor: 'on_action',
        },
    }, '[size=m]': {
        $container: {
            paddingX: 4,
            paddingY: 2,
            '@media.small': {
                paddingX: 1,
                paddingY: 1,
            },
        },
        '[alignment=icon-only]': {
            $container: {
                paddingX: 2,
                paddingY: 2,
            },
        },
    }, '[size=s]': {
        $container: {
            paddingX: 2,
            paddingY: 1,
        },
        '[alignment=icon-only]': {
            $container: {
                paddingX: 1,
                paddingY: 2,
            },
        },
    } }));
