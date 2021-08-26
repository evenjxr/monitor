import { __read } from '../../ext/tslib/tslib.es6.js';

var StyleRuleType;
(function (StyleRuleType) {
    StyleRuleType[StyleRuleType["Insert"] = 0] = "Insert";
    StyleRuleType[StyleRuleType["Remove"] = 1] = "Remove";
    StyleRuleType[StyleRuleType["Snapshot"] = 2] = "Snapshot";
})(StyleRuleType || (StyleRuleType = {}));
function applyVirtualStyleRulesToNode(storedRules, styleNode) {
    storedRules.forEach(function (rule) {
        var _a, _b;
        if (rule.type === StyleRuleType.Insert) {
            try {
                (_a = styleNode.sheet) === null || _a === void 0 ? void 0 : _a.insertRule(rule.cssText, rule.index);
            }
            catch (e) {
            }
        }
        else if (rule.type === StyleRuleType.Remove) {
            try {
                (_b = styleNode.sheet) === null || _b === void 0 ? void 0 : _b.deleteRule(rule.index);
            }
            catch (e) {
            }
        }
        else if (rule.type === StyleRuleType.Snapshot) {
            restoreSnapshotOfStyleRulesToNode(rule.cssTexts, styleNode);
        }
    });
}
function restoreSnapshotOfStyleRulesToNode(cssTexts, styleNode) {
    var _a;
    try {
        var existingRules = Array.from(((_a = styleNode.sheet) === null || _a === void 0 ? void 0 : _a.cssRules) || []).map(function (rule) { return rule.cssText; });
        var existingRulesReversed = Object.entries(existingRules).reverse();
        var lastMatch_1 = existingRules.length;
        existingRulesReversed.forEach(function (_a) {
            var _b;
            var _c = __read(_a, 2), index = _c[0], rule = _c[1];
            var indexOf = cssTexts.indexOf(rule);
            if (indexOf === -1 || indexOf > lastMatch_1) {
                try {
                    (_b = styleNode.sheet) === null || _b === void 0 ? void 0 : _b.deleteRule(Number(index));
                }
                catch (e) {
                }
            }
            lastMatch_1 = indexOf;
        });
        cssTexts.forEach(function (cssText, index) {
            var _a, _b, _c;
            try {
                if (((_b = (_a = styleNode.sheet) === null || _a === void 0 ? void 0 : _a.cssRules[index]) === null || _b === void 0 ? void 0 : _b.cssText) !== cssText) {
                    (_c = styleNode.sheet) === null || _c === void 0 ? void 0 : _c.insertRule(cssText, index);
                }
            }
            catch (e) {
            }
        });
    }
    catch (e) {
    }
}
function storeCSSRules(parentElement, virtualStyleRulesMap) {
    var _a;
    try {
        var cssTexts = Array.from(((_a = parentElement.sheet) === null || _a === void 0 ? void 0 : _a.cssRules) || []).map(function (rule) { return rule.cssText; });
        virtualStyleRulesMap.set(parentElement, [
            {
                type: StyleRuleType.Snapshot,
                cssTexts: cssTexts,
            },
        ]);
    }
    catch (e) {
    }
}

export { StyleRuleType, applyVirtualStyleRulesToNode, storeCSSRules };
