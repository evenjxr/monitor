'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

var NodeType;
(function (NodeType) {
    NodeType[NodeType["Document"] = 0] = "Document";
    NodeType[NodeType["DocumentType"] = 1] = "DocumentType";
    NodeType[NodeType["Element"] = 2] = "Element";
    NodeType[NodeType["Text"] = 3] = "Text";
    NodeType[NodeType["CDATA"] = 4] = "CDATA";
    NodeType[NodeType["Comment"] = 5] = "Comment";
})(NodeType || (NodeType = {}));

function isElement(n) {
    return n.nodeType === n.ELEMENT_NODE;
}
function isShadowRoot(n) {
    var _a;
    var host = (_a = n) === null || _a === void 0 ? void 0 : _a.host;
    return Boolean(host && host.shadowRoot && host.shadowRoot === n);
}
function maskInputValue(_a) {
    var maskInputOptions = _a.maskInputOptions, tagName = _a.tagName, type = _a.type, value = _a.value, maskInputFn = _a.maskInputFn;
    var text = value || '';
    if (maskInputOptions[tagName.toLowerCase()] ||
        maskInputOptions[type]) {
        if (maskInputFn) {
            text = maskInputFn(text);
        }
        else {
            text = '*'.repeat(text.length);
        }
    }
    return text;
}

var _id = 1;
var tagNameRegex = RegExp('[^a-z0-9-_:]');
var IGNORED_NODE = -2;
function genId() {
    return _id++;
}
function getValidTagName(element) {
    if (element instanceof HTMLFormElement) {
        return 'form';
    }
    var processedTagName = element.tagName.toLowerCase().trim();
    if (tagNameRegex.test(processedTagName)) {
        return 'div';
    }
    return processedTagName;
}
function getCssRulesString(s) {
    try {
        var rules = s.rules || s.cssRules;
        return rules ? Array.from(rules).map(getCssRuleString).join('') : null;
    }
    catch (error) {
        return null;
    }
}
function getCssRuleString(rule) {
    return isCSSImportRule(rule)
        ? getCssRulesString(rule.styleSheet) || ''
        : rule.cssText;
}
function isCSSImportRule(rule) {
    return 'styleSheet' in rule;
}
function extractOrigin(url) {
    var origin;
    if (url.indexOf('//') > -1) {
        origin = url.split('/').slice(0, 3).join('/');
    }
    else {
        origin = url.split('/')[0];
    }
    origin = origin.split('?')[0];
    return origin;
}
var URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm;
var RELATIVE_PATH = /^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/|#).*/;
var DATA_URI = /^(data:)([^,]*),(.*)/i;
function absoluteToStylesheet(cssText, href) {
    return (cssText || '').replace(URL_IN_CSS_REF, function (origin, quote1, path1, quote2, path2, path3) {
        var filePath = path1 || path2 || path3;
        var maybeQuote = quote1 || quote2 || '';
        if (!filePath) {
            return origin;
        }
        if (!RELATIVE_PATH.test(filePath)) {
            return "url(" + maybeQuote + filePath + maybeQuote + ")";
        }
        if (DATA_URI.test(filePath)) {
            return "url(" + maybeQuote + filePath + maybeQuote + ")";
        }
        if (filePath[0] === '/') {
            return "url(" + maybeQuote + (extractOrigin(href) + filePath) + maybeQuote + ")";
        }
        var stack = href.split('/');
        var parts = filePath.split('/');
        stack.pop();
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var part = parts_1[_i];
            if (part === '.') {
                continue;
            }
            else if (part === '..') {
                stack.pop();
            }
            else {
                stack.push(part);
            }
        }
        return "url(" + maybeQuote + stack.join('/') + maybeQuote + ")";
    });
}
var SRCSET_NOT_SPACES = /^[^ \t\n\r\u000c]+/;
var SRCSET_COMMAS_OR_SPACES = /^[, \t\n\r\u000c]+/;
function getAbsoluteSrcsetString(doc, attributeValue) {
    if (attributeValue.trim() === '') {
        return attributeValue;
    }
    var pos = 0;
    function collectCharacters(regEx) {
        var chars, match = regEx.exec(attributeValue.substring(pos));
        if (match) {
            chars = match[0];
            pos += chars.length;
            return chars;
        }
        return '';
    }
    var output = [];
    while (true) {
        collectCharacters(SRCSET_COMMAS_OR_SPACES);
        if (pos >= attributeValue.length) {
            break;
        }
        var url = collectCharacters(SRCSET_NOT_SPACES);
        if (url.slice(-1) === ',') {
            url = absoluteToDoc(doc, url.substring(0, url.length - 1));
            output.push(url);
        }
        else {
            var descriptorsStr = '';
            url = absoluteToDoc(doc, url);
            var inParens = false;
            while (true) {
                var c = attributeValue.charAt(pos);
                if (c === '') {
                    output.push((url + descriptorsStr).trim());
                    break;
                }
                else if (!inParens) {
                    if (c === ',') {
                        pos += 1;
                        output.push((url + descriptorsStr).trim());
                        break;
                    }
                    else if (c === '(') {
                        inParens = true;
                    }
                }
                else {
                    if (c === ')') {
                        inParens = false;
                    }
                }
                descriptorsStr += c;
                pos += 1;
            }
        }
    }
    return output.join(', ');
}
function absoluteToDoc(doc, attributeValue) {
    if (!attributeValue || attributeValue.trim() === '') {
        return attributeValue;
    }
    var a = doc.createElement('a');
    a.href = attributeValue;
    return a.href;
}
function isSVGElement(el) {
    return el.tagName === 'svg' || el instanceof SVGElement;
}
function getHref() {
    var a = document.createElement('a');
    a.href = '';
    return a.href;
}
function transformAttribute(doc, tagName, name, value) {
    if (name === 'src' || ((name === 'href' || name === 'xlink:href') && value)) {
        return absoluteToDoc(doc, value);
    }
    else if (name === 'background' &&
        value &&
        (tagName === 'table' || tagName === 'td' || tagName === 'th')) {
        return absoluteToDoc(doc, value);
    }
    else if (name === 'srcset' && value) {
        return getAbsoluteSrcsetString(doc, value);
    }
    else if (name === 'style' && value) {
        return absoluteToStylesheet(value, getHref());
    }
    else {
        return value;
    }
}
function _isBlockedElement(element, blockClass, blockSelector) {
    if (typeof blockClass === 'string') {
        if (element.classList.contains(blockClass)) {
            return true;
        }
    }
    else {
        for (var eIndex = 0; eIndex < element.classList.length; eIndex++) {
            var className = element.classList[eIndex];
            if (blockClass.test(className)) {
                return true;
            }
        }
    }
    if (blockSelector) {
        return element.matches(blockSelector);
    }
    return false;
}
function needMaskingText(node, maskTextClass, maskTextSelector) {
    if (!node) {
        return false;
    }
    if (node.nodeType === node.ELEMENT_NODE) {
        if (typeof maskTextClass === 'string') {
            if (node.classList.contains(maskTextClass)) {
                return true;
            }
        }
        else {
            node.classList.forEach(function (className) {
                if (maskTextClass.test(className)) {
                    return true;
                }
            });
        }
        if (maskTextSelector) {
            if (node.matches(maskTextSelector)) {
                return true;
            }
        }
        return needMaskingText(node.parentNode, maskTextClass, maskTextSelector);
    }
    if (node.nodeType === node.TEXT_NODE) {
        return needMaskingText(node.parentNode, maskTextClass, maskTextSelector);
    }
    return needMaskingText(node.parentNode, maskTextClass, maskTextSelector);
}
function onceIframeLoaded(iframeEl, listener, iframeLoadTimeout) {
    var win = iframeEl.contentWindow;
    if (!win) {
        return;
    }
    var fired = false;
    var readyState;
    try {
        readyState = win.document.readyState;
    }
    catch (error) {
        return;
    }
    if (readyState !== 'complete') {
        var timer_1 = setTimeout(function () {
            if (!fired) {
                listener();
                fired = true;
            }
        }, iframeLoadTimeout);
        iframeEl.addEventListener('load', function () {
            clearTimeout(timer_1);
            fired = true;
            listener();
        });
        return;
    }
    var blankUrl = 'about:blank';
    if (win.location.href !== blankUrl ||
        iframeEl.src === blankUrl ||
        iframeEl.src === '') {
        setTimeout(listener, 0);
        return;
    }
    iframeEl.addEventListener('load', listener);
}
function serializeNode(n, options) {
    var doc = options.doc, blockClass = options.blockClass, blockSelector = options.blockSelector, maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, inlineStylesheet = options.inlineStylesheet, _a = options.maskInputOptions, maskInputOptions = _a === void 0 ? {} : _a, maskTextFn = options.maskTextFn, maskInputFn = options.maskInputFn, recordCanvas = options.recordCanvas, keepIframeSrcFn = options.keepIframeSrcFn;
    var rootId;
    if (doc.__sn) {
        var docId = doc.__sn.id;
        rootId = docId === 1 ? undefined : docId;
    }
    switch (n.nodeType) {
        case n.DOCUMENT_NODE:
            return {
                type: NodeType.Document,
                childNodes: [],
                rootId: rootId,
            };
        case n.DOCUMENT_TYPE_NODE:
            return {
                type: NodeType.DocumentType,
                name: n.name,
                publicId: n.publicId,
                systemId: n.systemId,
                rootId: rootId,
            };
        case n.ELEMENT_NODE:
            var needBlock = _isBlockedElement(n, blockClass, blockSelector);
            var tagName = getValidTagName(n);
            var attributes_1 = {};
            for (var _i = 0, _b = Array.from(n.attributes); _i < _b.length; _i++) {
                var _c = _b[_i], name = _c.name, value = _c.value;
                attributes_1[name] = transformAttribute(doc, tagName, name, value);
            }
            if (tagName === 'link' && inlineStylesheet) {
                var stylesheet = Array.from(doc.styleSheets).find(function (s) {
                    return s.href === n.href;
                });
                var cssText = getCssRulesString(stylesheet);
                if (cssText) {
                    delete attributes_1.rel;
                    delete attributes_1.href;
                    attributes_1._cssText = absoluteToStylesheet(cssText, stylesheet.href);
                }
            }
            if (tagName === 'style' &&
                n.sheet &&
                !(n.innerText ||
                    n.textContent ||
                    '').trim().length) {
                var cssText = getCssRulesString(n.sheet);
                if (cssText) {
                    attributes_1._cssText = absoluteToStylesheet(cssText, getHref());
                }
            }
            if (tagName === 'input' ||
                tagName === 'textarea' ||
                tagName === 'select') {
                var value = n.value;
                if (attributes_1.type !== 'radio' &&
                    attributes_1.type !== 'checkbox' &&
                    attributes_1.type !== 'submit' &&
                    attributes_1.type !== 'button' &&
                    value) {
                    attributes_1.value = maskInputValue({
                        type: attributes_1.type,
                        tagName: tagName,
                        value: value,
                        maskInputOptions: maskInputOptions,
                        maskInputFn: maskInputFn,
                    });
                }
                else if (n.checked) {
                    attributes_1.checked = n.checked;
                }
            }
            if (tagName === 'option') {
                var selectValue = n.parentElement;
                if (attributes_1.value === selectValue.value) {
                    attributes_1.selected = n.selected;
                }
            }
            if (tagName === 'canvas' && recordCanvas) {
                attributes_1.rr_dataURL = n.toDataURL();
            }
            if (tagName === 'audio' || tagName === 'video') {
                attributes_1.rr_mediaState = n.paused
                    ? 'paused'
                    : 'played';
                attributes_1.rr_mediaCurrentTime = n.currentTime;
            }
            if (n.scrollLeft) {
                attributes_1.rr_scrollLeft = n.scrollLeft;
            }
            if (n.scrollTop) {
                attributes_1.rr_scrollTop = n.scrollTop;
            }
            if (needBlock) {
                var _d = n.getBoundingClientRect(), width = _d.width, height = _d.height;
                attributes_1 = {
                    class: attributes_1.class,
                    rr_width: width + "px",
                    rr_height: height + "px",
                };
            }
            if (tagName === 'iframe' && !keepIframeSrcFn(attributes_1.src)) {
                delete attributes_1.src;
            }
            return {
                type: NodeType.Element,
                tagName: tagName,
                attributes: attributes_1,
                childNodes: [],
                isSVG: isSVGElement(n) || undefined,
                needBlock: needBlock,
                rootId: rootId,
            };
        case n.TEXT_NODE:
            var parentTagName = n.parentNode && n.parentNode.tagName;
            var textContent = n.textContent;
            var isStyle = parentTagName === 'STYLE' ? true : undefined;
            var isScript = parentTagName === 'SCRIPT' ? true : undefined;
            if (isStyle && textContent) {
                textContent = absoluteToStylesheet(textContent, getHref());
            }
            if (isScript) {
                textContent = 'SCRIPT_PLACEHOLDER';
            }
            if (!isStyle &&
                !isScript &&
                needMaskingText(n, maskTextClass, maskTextSelector) &&
                textContent) {
                textContent = maskTextFn
                    ? maskTextFn(textContent)
                    : textContent.replace(/[\S]/g, '*');
            }
            return {
                type: NodeType.Text,
                textContent: textContent || '',
                isStyle: isStyle,
                rootId: rootId,
            };
        case n.CDATA_SECTION_NODE:
            return {
                type: NodeType.CDATA,
                textContent: '',
                rootId: rootId,
            };
        case n.COMMENT_NODE:
            return {
                type: NodeType.Comment,
                textContent: n.textContent || '',
                rootId: rootId,
            };
        default:
            return false;
    }
}
function lowerIfExists(maybeAttr) {
    if (maybeAttr === undefined) {
        return '';
    }
    else {
        return maybeAttr.toLowerCase();
    }
}
function slimDOMExcluded(sn, slimDOMOptions) {
    if (slimDOMOptions.comment && sn.type === NodeType.Comment) {
        return true;
    }
    else if (sn.type === NodeType.Element) {
        if (slimDOMOptions.script &&
            (sn.tagName === 'script' ||
                (sn.tagName === 'link' &&
                    sn.attributes.rel === 'preload' &&
                    sn.attributes.as === 'script') ||
                (sn.tagName === 'link' &&
                    sn.attributes.rel === 'prefetch' &&
                    typeof sn.attributes.href === 'string' &&
                    sn.attributes.href.endsWith('.js')))) {
            return true;
        }
        else if (slimDOMOptions.headFavicon &&
            ((sn.tagName === 'link' && sn.attributes.rel === 'shortcut icon') ||
                (sn.tagName === 'meta' &&
                    (lowerIfExists(sn.attributes.name).match(/^msapplication-tile(image|color)$/) ||
                        lowerIfExists(sn.attributes.name) === 'application-name' ||
                        lowerIfExists(sn.attributes.rel) === 'icon' ||
                        lowerIfExists(sn.attributes.rel) === 'apple-touch-icon' ||
                        lowerIfExists(sn.attributes.rel) === 'shortcut icon')))) {
            return true;
        }
        else if (sn.tagName === 'meta') {
            if (slimDOMOptions.headMetaDescKeywords &&
                lowerIfExists(sn.attributes.name).match(/^description|keywords$/)) {
                return true;
            }
            else if (slimDOMOptions.headMetaSocial &&
                (lowerIfExists(sn.attributes.property).match(/^(og|twitter|fb):/) ||
                    lowerIfExists(sn.attributes.name).match(/^(og|twitter):/) ||
                    lowerIfExists(sn.attributes.name) === 'pinterest')) {
                return true;
            }
            else if (slimDOMOptions.headMetaRobots &&
                (lowerIfExists(sn.attributes.name) === 'robots' ||
                    lowerIfExists(sn.attributes.name) === 'googlebot' ||
                    lowerIfExists(sn.attributes.name) === 'bingbot')) {
                return true;
            }
            else if (slimDOMOptions.headMetaHttpEquiv &&
                sn.attributes['http-equiv'] !== undefined) {
                return true;
            }
            else if (slimDOMOptions.headMetaAuthorship &&
                (lowerIfExists(sn.attributes.name) === 'author' ||
                    lowerIfExists(sn.attributes.name) === 'generator' ||
                    lowerIfExists(sn.attributes.name) === 'framework' ||
                    lowerIfExists(sn.attributes.name) === 'publisher' ||
                    lowerIfExists(sn.attributes.name) === 'progid' ||
                    lowerIfExists(sn.attributes.property).match(/^article:/) ||
                    lowerIfExists(sn.attributes.property).match(/^product:/))) {
                return true;
            }
            else if (slimDOMOptions.headMetaVerification &&
                (lowerIfExists(sn.attributes.name) === 'google-site-verification' ||
                    lowerIfExists(sn.attributes.name) === 'yandex-verification' ||
                    lowerIfExists(sn.attributes.name) === 'csrf-token' ||
                    lowerIfExists(sn.attributes.name) === 'p:domain_verify' ||
                    lowerIfExists(sn.attributes.name) === 'verify-v1' ||
                    lowerIfExists(sn.attributes.name) === 'verification' ||
                    lowerIfExists(sn.attributes.name) === 'shopify-checkout-api-token')) {
                return true;
            }
        }
    }
    return false;
}
function serializeNodeWithId(n, options) {
    var doc = options.doc, map = options.map, blockClass = options.blockClass, blockSelector = options.blockSelector, maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, _a = options.skipChild, skipChild = _a === void 0 ? false : _a, _b = options.inlineStylesheet, inlineStylesheet = _b === void 0 ? true : _b, _c = options.maskInputOptions, maskInputOptions = _c === void 0 ? {} : _c, maskTextFn = options.maskTextFn, maskInputFn = options.maskInputFn, slimDOMOptions = options.slimDOMOptions, _d = options.recordCanvas, recordCanvas = _d === void 0 ? false : _d, onSerialize = options.onSerialize, onIframeLoad = options.onIframeLoad, _e = options.iframeLoadTimeout, iframeLoadTimeout = _e === void 0 ? 5000 : _e, _f = options.keepIframeSrcFn, keepIframeSrcFn = _f === void 0 ? function () { return false; } : _f;
    var _g = options.preserveWhiteSpace, preserveWhiteSpace = _g === void 0 ? true : _g;
    var _serializedNode = serializeNode(n, {
        doc: doc,
        blockClass: blockClass,
        blockSelector: blockSelector,
        maskTextClass: maskTextClass,
        maskTextSelector: maskTextSelector,
        inlineStylesheet: inlineStylesheet,
        maskInputOptions: maskInputOptions,
        maskTextFn: maskTextFn,
        maskInputFn: maskInputFn,
        recordCanvas: recordCanvas,
        keepIframeSrcFn: keepIframeSrcFn,
    });
    if (!_serializedNode) {
        console.warn(n, 'not serialized');
        return null;
    }
    var id;
    if ('__sn' in n) {
        id = n.__sn.id;
    }
    else if (slimDOMExcluded(_serializedNode, slimDOMOptions) ||
        (!preserveWhiteSpace &&
            _serializedNode.type === NodeType.Text &&
            !_serializedNode.isStyle &&
            !_serializedNode.textContent.replace(/^\s+|\s+$/gm, '').length)) {
        id = IGNORED_NODE;
    }
    else {
        id = genId();
    }
    var serializedNode = Object.assign(_serializedNode, { id: id });
    n.__sn = serializedNode;
    if (id === IGNORED_NODE) {
        return null;
    }
    map[id] = n;
    if (onSerialize) {
        onSerialize(n);
    }
    var recordChild = !skipChild;
    if (serializedNode.type === NodeType.Element) {
        recordChild = recordChild && !serializedNode.needBlock;
        delete serializedNode.needBlock;
    }
    if ((serializedNode.type === NodeType.Document ||
        serializedNode.type === NodeType.Element) &&
        recordChild) {
        if (slimDOMOptions.headWhitespace &&
            _serializedNode.type === NodeType.Element &&
            _serializedNode.tagName === 'head') {
            preserveWhiteSpace = false;
        }
        var bypassOptions = {
            doc: doc,
            map: map,
            blockClass: blockClass,
            blockSelector: blockSelector,
            maskTextClass: maskTextClass,
            maskTextSelector: maskTextSelector,
            skipChild: skipChild,
            inlineStylesheet: inlineStylesheet,
            maskInputOptions: maskInputOptions,
            maskTextFn: maskTextFn,
            maskInputFn: maskInputFn,
            slimDOMOptions: slimDOMOptions,
            recordCanvas: recordCanvas,
            preserveWhiteSpace: preserveWhiteSpace,
            onSerialize: onSerialize,
            onIframeLoad: onIframeLoad,
            iframeLoadTimeout: iframeLoadTimeout,
            keepIframeSrcFn: keepIframeSrcFn,
        };
        for (var _i = 0, _h = Array.from(n.childNodes); _i < _h.length; _i++) {
            var childN = _h[_i];
            var serializedChildNode = serializeNodeWithId(childN, bypassOptions);
            if (serializedChildNode) {
                serializedNode.childNodes.push(serializedChildNode);
            }
        }
        if (isElement(n) && n.shadowRoot) {
            serializedNode.isShadowHost = true;
            for (var _j = 0, _k = Array.from(n.shadowRoot.childNodes); _j < _k.length; _j++) {
                var childN = _k[_j];
                var serializedChildNode = serializeNodeWithId(childN, bypassOptions);
                if (serializedChildNode) {
                    serializedChildNode.isShadow = true;
                    serializedNode.childNodes.push(serializedChildNode);
                }
            }
        }
    }
    if (n.parentNode && isShadowRoot(n.parentNode)) {
        serializedNode.isShadow = true;
    }
    if (serializedNode.type === NodeType.Element &&
        serializedNode.tagName === 'iframe') {
        onceIframeLoaded(n, function () {
            var iframeDoc = n.contentDocument;
            if (iframeDoc && onIframeLoad) {
                var serializedIframeNode = serializeNodeWithId(iframeDoc, {
                    doc: iframeDoc,
                    map: map,
                    blockClass: blockClass,
                    blockSelector: blockSelector,
                    maskTextClass: maskTextClass,
                    maskTextSelector: maskTextSelector,
                    skipChild: false,
                    inlineStylesheet: inlineStylesheet,
                    maskInputOptions: maskInputOptions,
                    maskTextFn: maskTextFn,
                    maskInputFn: maskInputFn,
                    slimDOMOptions: slimDOMOptions,
                    recordCanvas: recordCanvas,
                    preserveWhiteSpace: preserveWhiteSpace,
                    onSerialize: onSerialize,
                    onIframeLoad: onIframeLoad,
                    iframeLoadTimeout: iframeLoadTimeout,
                    keepIframeSrcFn: keepIframeSrcFn,
                });
                if (serializedIframeNode) {
                    onIframeLoad(n, serializedIframeNode);
                }
            }
        }, iframeLoadTimeout);
    }
    return serializedNode;
}
function snapshot(n, options) {
    var _a = options || {}, _b = _a.blockClass, blockClass = _b === void 0 ? 'rr-block' : _b, _c = _a.blockSelector, blockSelector = _c === void 0 ? null : _c, _d = _a.maskTextClass, maskTextClass = _d === void 0 ? 'rr-mask' : _d, _e = _a.maskTextSelector, maskTextSelector = _e === void 0 ? null : _e, _f = _a.inlineStylesheet, inlineStylesheet = _f === void 0 ? true : _f, _g = _a.recordCanvas, recordCanvas = _g === void 0 ? false : _g, _h = _a.maskAllInputs, maskAllInputs = _h === void 0 ? false : _h, maskTextFn = _a.maskTextFn, maskInputFn = _a.maskInputFn, _j = _a.slimDOM, slimDOM = _j === void 0 ? false : _j, preserveWhiteSpace = _a.preserveWhiteSpace, onSerialize = _a.onSerialize, onIframeLoad = _a.onIframeLoad, iframeLoadTimeout = _a.iframeLoadTimeout, _k = _a.keepIframeSrcFn, keepIframeSrcFn = _k === void 0 ? function () { return false; } : _k;
    var idNodeMap = {};
    var maskInputOptions = maskAllInputs === true
        ? {
            color: true,
            date: true,
            'datetime-local': true,
            email: true,
            month: true,
            number: true,
            range: true,
            search: true,
            tel: true,
            text: true,
            time: true,
            url: true,
            week: true,
            textarea: true,
            select: true,
            password: true,
        }
        : maskAllInputs === false
            ? {
                password: true,
            }
            : maskAllInputs;
    var slimDOMOptions = slimDOM === true || slimDOM === 'all'
        ?
            {
                script: true,
                comment: true,
                headFavicon: true,
                headWhitespace: true,
                headMetaDescKeywords: slimDOM === 'all',
                headMetaSocial: true,
                headMetaRobots: true,
                headMetaHttpEquiv: true,
                headMetaAuthorship: true,
                headMetaVerification: true,
            }
        : slimDOM === false
            ? {}
            : slimDOM;
    return [
        serializeNodeWithId(n, {
            doc: n,
            map: idNodeMap,
            blockClass: blockClass,
            blockSelector: blockSelector,
            maskTextClass: maskTextClass,
            maskTextSelector: maskTextSelector,
            skipChild: false,
            inlineStylesheet: inlineStylesheet,
            maskInputOptions: maskInputOptions,
            maskTextFn: maskTextFn,
            maskInputFn: maskInputFn,
            slimDOMOptions: slimDOMOptions,
            recordCanvas: recordCanvas,
            preserveWhiteSpace: preserveWhiteSpace,
            onSerialize: onSerialize,
            onIframeLoad: onIframeLoad,
            iframeLoadTimeout: iframeLoadTimeout,
            keepIframeSrcFn: keepIframeSrcFn,
        }),
        idNodeMap,
    ];
}

var EventType;
(function (EventType) {
    EventType[EventType["DomContentLoaded"] = 0] = "DomContentLoaded";
    EventType[EventType["Load"] = 1] = "Load";
    EventType[EventType["FullSnapshot"] = 2] = "FullSnapshot";
    EventType[EventType["IncrementalSnapshot"] = 3] = "IncrementalSnapshot";
    EventType[EventType["Meta"] = 4] = "Meta";
    EventType[EventType["Custom"] = 5] = "Custom";
    EventType[EventType["Plugin"] = 6] = "Plugin";
})(EventType || (EventType = {}));
var IncrementalSource;
(function (IncrementalSource) {
    IncrementalSource[IncrementalSource["Mutation"] = 0] = "Mutation";
    IncrementalSource[IncrementalSource["MouseMove"] = 1] = "MouseMove";
    IncrementalSource[IncrementalSource["MouseInteraction"] = 2] = "MouseInteraction";
    IncrementalSource[IncrementalSource["Scroll"] = 3] = "Scroll";
    IncrementalSource[IncrementalSource["ViewportResize"] = 4] = "ViewportResize";
    IncrementalSource[IncrementalSource["Input"] = 5] = "Input";
    IncrementalSource[IncrementalSource["TouchMove"] = 6] = "TouchMove";
    IncrementalSource[IncrementalSource["MediaInteraction"] = 7] = "MediaInteraction";
    IncrementalSource[IncrementalSource["StyleSheetRule"] = 8] = "StyleSheetRule";
    IncrementalSource[IncrementalSource["CanvasMutation"] = 9] = "CanvasMutation";
    IncrementalSource[IncrementalSource["Font"] = 10] = "Font";
    IncrementalSource[IncrementalSource["Log"] = 11] = "Log";
    IncrementalSource[IncrementalSource["Drag"] = 12] = "Drag";
})(IncrementalSource || (IncrementalSource = {}));
var MouseInteractions;
(function (MouseInteractions) {
    MouseInteractions[MouseInteractions["MouseUp"] = 0] = "MouseUp";
    MouseInteractions[MouseInteractions["MouseDown"] = 1] = "MouseDown";
    MouseInteractions[MouseInteractions["Click"] = 2] = "Click";
    MouseInteractions[MouseInteractions["ContextMenu"] = 3] = "ContextMenu";
    MouseInteractions[MouseInteractions["DblClick"] = 4] = "DblClick";
    MouseInteractions[MouseInteractions["Focus"] = 5] = "Focus";
    MouseInteractions[MouseInteractions["Blur"] = 6] = "Blur";
    MouseInteractions[MouseInteractions["TouchStart"] = 7] = "TouchStart";
    MouseInteractions[MouseInteractions["TouchMove_Departed"] = 8] = "TouchMove_Departed";
    MouseInteractions[MouseInteractions["TouchEnd"] = 9] = "TouchEnd";
})(MouseInteractions || (MouseInteractions = {}));
var MediaInteractions;
(function (MediaInteractions) {
    MediaInteractions[MediaInteractions["Play"] = 0] = "Play";
    MediaInteractions[MediaInteractions["Pause"] = 1] = "Pause";
    MediaInteractions[MediaInteractions["Seeked"] = 2] = "Seeked";
})(MediaInteractions || (MediaInteractions = {}));
var ReplayerEvents;
(function (ReplayerEvents) {
    ReplayerEvents["Start"] = "start";
    ReplayerEvents["Pause"] = "pause";
    ReplayerEvents["Resume"] = "resume";
    ReplayerEvents["Resize"] = "resize";
    ReplayerEvents["Finish"] = "finish";
    ReplayerEvents["FullsnapshotRebuilded"] = "fullsnapshot-rebuilded";
    ReplayerEvents["LoadStylesheetStart"] = "load-stylesheet-start";
    ReplayerEvents["LoadStylesheetEnd"] = "load-stylesheet-end";
    ReplayerEvents["SkipStart"] = "skip-start";
    ReplayerEvents["SkipEnd"] = "skip-end";
    ReplayerEvents["MouseInteraction"] = "mouse-interaction";
    ReplayerEvents["EventCast"] = "event-cast";
    ReplayerEvents["CustomEvent"] = "custom-event";
    ReplayerEvents["Flush"] = "flush";
    ReplayerEvents["StateChange"] = "state-change";
    ReplayerEvents["PlayBack"] = "play-back";
})(ReplayerEvents || (ReplayerEvents = {}));

function on(type, fn, target) {
    if (target === void 0) { target = document; }
    var options = { capture: true, passive: true };
    target.addEventListener(type, fn, options);
    return function () { return target.removeEventListener(type, fn, options); };
}
function createMirror() {
    return {
        map: {},
        getId: function (n) {
            if (!n.__sn) {
                return -1;
            }
            return n.__sn.id;
        },
        getNode: function (id) {
            return this.map[id] || null;
        },
        removeNodeFromMap: function (n) {
            var _this = this;
            var id = n.__sn && n.__sn.id;
            delete this.map[id];
            if (n.childNodes) {
                n.childNodes.forEach(function (child) {
                    return _this.removeNodeFromMap(child);
                });
            }
        },
        has: function (id) {
            return this.map.hasOwnProperty(id);
        },
        reset: function () {
            this.map = {};
        },
    };
}
var DEPARTED_MIRROR_ACCESS_WARNING = 'Please stop import mirror directly. Instead of that,' +
    '\r\n' +
    'now you can use replayer.getMirror() to access the mirror instance of a replayer,' +
    '\r\n' +
    'or you can use record.mirror to access the mirror instance during recording.';
var _mirror = {
    map: {},
    getId: function () {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return -1;
    },
    getNode: function () {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return null;
    },
    removeNodeFromMap: function () {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    },
    has: function () {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return false;
    },
    reset: function () {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    },
};
if (typeof window !== 'undefined' && window.Proxy && window.Reflect) {
    _mirror = new Proxy(_mirror, {
        get: function (target, prop, receiver) {
            if (prop === 'map') {
                console.error(DEPARTED_MIRROR_ACCESS_WARNING);
            }
            return Reflect.get(target, prop, receiver);
        },
    });
}
function throttle(func, wait, options) {
    if (options === void 0) { options = {}; }
    var timeout = null;
    var previous = 0;
    return function (arg) {
        var now = Date.now();
        if (!previous && options.leading === false) {
            previous = now;
        }
        var remaining = wait - (now - previous);
        var context = this;
        var args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                window.clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(context, args);
        }
        else if (!timeout && options.trailing !== false) {
            timeout = window.setTimeout(function () {
                previous = options.leading === false ? 0 : Date.now();
                timeout = null;
                func.apply(context, args);
            }, remaining);
        }
    };
}
function hookSetter(target, key, d, isRevoked, win) {
    if (win === void 0) { win = window; }
    var original = win.Object.getOwnPropertyDescriptor(target, key);
    win.Object.defineProperty(target, key, isRevoked
        ? d
        : {
            set: function (value) {
                var _this = this;
                setTimeout(function () {
                    d.set.call(_this, value);
                }, 0);
                if (original && original.set) {
                    original.set.call(this, value);
                }
            },
        });
    return function () { return hookSetter(target, key, original || {}, true); };
}
function patch(source, name, replacement) {
    try {
        if (!(name in source)) {
            return function () { };
        }
        var original_1 = source[name];
        var wrapped = replacement(original_1);
        if (typeof wrapped === 'function') {
            wrapped.prototype = wrapped.prototype || {};
            Object.defineProperties(wrapped, {
                __rrweb_original__: {
                    enumerable: false,
                    value: original_1,
                },
            });
        }
        source[name] = wrapped;
        return function () {
            source[name] = original_1;
        };
    }
    catch (_a) {
        return function () { };
    }
}
function getWindowHeight() {
    return (window.innerHeight ||
        (document.documentElement && document.documentElement.clientHeight) ||
        (document.body && document.body.clientHeight));
}
function getWindowWidth() {
    return (window.innerWidth ||
        (document.documentElement && document.documentElement.clientWidth) ||
        (document.body && document.body.clientWidth));
}
function isBlocked(node, blockClass) {
    if (!node) {
        return false;
    }
    if (node.nodeType === node.ELEMENT_NODE) {
        var needBlock_1 = false;
        if (typeof blockClass === 'string') {
            needBlock_1 = node.classList.contains(blockClass);
        }
        else {
            node.classList.forEach(function (className) {
                if (blockClass.test(className)) {
                    needBlock_1 = true;
                }
            });
        }
        return needBlock_1 || isBlocked(node.parentNode, blockClass);
    }
    if (node.nodeType === node.TEXT_NODE) {
        return isBlocked(node.parentNode, blockClass);
    }
    return isBlocked(node.parentNode, blockClass);
}
function isIgnored(n) {
    if ('__sn' in n) {
        return n.__sn.id === IGNORED_NODE;
    }
    return false;
}
function isAncestorRemoved(target, mirror) {
    if (isShadowRoot(target)) {
        return false;
    }
    var id = mirror.getId(target);
    if (!mirror.has(id)) {
        return true;
    }
    if (target.parentNode &&
        target.parentNode.nodeType === target.DOCUMENT_NODE) {
        return false;
    }
    if (!target.parentNode) {
        return true;
    }
    return isAncestorRemoved(target.parentNode, mirror);
}
function isTouchEvent(event) {
    return Boolean(event.changedTouches);
}
function polyfill(win) {
    if (win === void 0) { win = window; }
    if ('NodeList' in win && !win.NodeList.prototype.forEach) {
        win.NodeList.prototype.forEach = Array.prototype
            .forEach;
    }
    if ('DOMTokenList' in win && !win.DOMTokenList.prototype.forEach) {
        win.DOMTokenList.prototype.forEach = Array.prototype
            .forEach;
    }
    if (!Node.prototype.contains) {
        Node.prototype.contains = function contains(node) {
            if (!(0 in arguments)) {
                throw new TypeError('1 argument is required');
            }
            do {
                if (this === node) {
                    return true;
                }
            } while ((node = node && node.parentNode));
            return false;
        };
    }
}
function isIframeINode(node) {
    if ('__sn' in node) {
        return (node.__sn.type === NodeType.Element && node.__sn.tagName === 'iframe');
    }
    return false;
}
function hasShadowRoot(n) {
    var _a;
    return Boolean((_a = n) === null || _a === void 0 ? void 0 : _a.shadowRoot);
}

function isNodeInLinkedList(n) {
    return '__ln' in n;
}
var DoubleLinkedList = (function () {
    function DoubleLinkedList() {
        this.length = 0;
        this.head = null;
    }
    DoubleLinkedList.prototype.get = function (position) {
        if (position >= this.length) {
            throw new Error('Position outside of list range');
        }
        var current = this.head;
        for (var index = 0; index < position; index++) {
            current = (current === null || current === void 0 ? void 0 : current.next) || null;
        }
        return current;
    };
    DoubleLinkedList.prototype.addNode = function (n) {
        var node = {
            value: n,
            previous: null,
            next: null,
        };
        n.__ln = node;
        if (n.previousSibling && isNodeInLinkedList(n.previousSibling)) {
            var current = n.previousSibling.__ln.next;
            node.next = current;
            node.previous = n.previousSibling.__ln;
            n.previousSibling.__ln.next = node;
            if (current) {
                current.previous = node;
            }
        }
        else if (n.nextSibling &&
            isNodeInLinkedList(n.nextSibling) &&
            n.nextSibling.__ln.previous) {
            var current = n.nextSibling.__ln.previous;
            node.previous = current;
            node.next = n.nextSibling.__ln;
            n.nextSibling.__ln.previous = node;
            if (current) {
                current.next = node;
            }
        }
        else {
            if (this.head) {
                this.head.previous = node;
            }
            node.next = this.head;
            this.head = node;
        }
        this.length++;
    };
    DoubleLinkedList.prototype.removeNode = function (n) {
        var current = n.__ln;
        if (!this.head) {
            return;
        }
        if (!current.previous) {
            this.head = current.next;
            if (this.head) {
                this.head.previous = null;
            }
        }
        else {
            current.previous.next = current.next;
            if (current.next) {
                current.next.previous = current.previous;
            }
        }
        if (n.__ln) {
            delete n.__ln;
        }
        this.length--;
    };
    return DoubleLinkedList;
}());
var moveKey = function (id, parentId) { return id + "@" + parentId; };
function isINode(n) {
    return '__sn' in n;
}
var MutationBuffer = (function () {
    function MutationBuffer() {
        var _this = this;
        this.frozen = false;
        this.locked = false;
        this.texts = [];
        this.attributes = [];
        this.removes = [];
        this.mapRemoves = [];
        this.movedMap = {};
        this.addedSet = new Set();
        this.movedSet = new Set();
        this.droppedSet = new Set();
        this.processMutations = function (mutations) {
            mutations.forEach(_this.processMutation);
            _this.emit();
        };
        this.emit = function () {
            var e_1, _a, e_2, _b;
            if (_this.frozen || _this.locked) {
                return;
            }
            var adds = [];
            var addList = new DoubleLinkedList();
            var getNextId = function (n) {
                var ns = n;
                var nextId = IGNORED_NODE;
                while (nextId === IGNORED_NODE) {
                    ns = ns && ns.nextSibling;
                    nextId = ns && _this.mirror.getId(ns);
                }
                if (nextId === -1 && isBlocked(n.nextSibling, _this.blockClass)) {
                    nextId = null;
                }
                return nextId;
            };
            var pushAdd = function (n) {
                var _a;
                var shadowHost = n.getRootNode
                    ? (_a = n.getRootNode()) === null || _a === void 0 ? void 0 : _a.host : null;
                var notInDoc = !_this.doc.contains(n) && !_this.doc.contains(shadowHost);
                if (!n.parentNode || notInDoc) {
                    return;
                }
                var parentId = isShadowRoot(n.parentNode)
                    ? _this.mirror.getId(shadowHost)
                    : _this.mirror.getId(n.parentNode);
                var nextId = getNextId(n);
                if (parentId === -1 || nextId === -1) {
                    return addList.addNode(n);
                }
                var sn = serializeNodeWithId(n, {
                    doc: _this.doc,
                    map: _this.mirror.map,
                    blockClass: _this.blockClass,
                    blockSelector: _this.blockSelector,
                    maskTextClass: _this.maskTextClass,
                    maskTextSelector: _this.maskTextSelector,
                    skipChild: true,
                    inlineStylesheet: _this.inlineStylesheet,
                    maskInputOptions: _this.maskInputOptions,
                    maskTextFn: _this.maskTextFn,
                    maskInputFn: _this.maskInputFn,
                    slimDOMOptions: _this.slimDOMOptions,
                    recordCanvas: _this.recordCanvas,
                    onSerialize: function (currentN) {
                        if (isIframeINode(currentN)) {
                            _this.iframeManager.addIframe(currentN);
                        }
                        if (hasShadowRoot(n)) {
                            _this.shadowDomManager.addShadowRoot(n.shadowRoot, document);
                        }
                    },
                    onIframeLoad: function (iframe, childSn) {
                        _this.iframeManager.attachIframe(iframe, childSn);
                    },
                });
                if (sn) {
                    adds.push({
                        parentId: parentId,
                        nextId: nextId,
                        node: sn,
                    });
                }
            };
            while (_this.mapRemoves.length) {
                _this.mirror.removeNodeFromMap(_this.mapRemoves.shift());
            }
            try {
                for (var _c = __values(_this.movedSet), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var n = _d.value;
                    if (isParentRemoved(_this.removes, n, _this.mirror) &&
                        !_this.movedSet.has(n.parentNode)) {
                        continue;
                    }
                    pushAdd(n);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var _e = __values(_this.addedSet), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var n = _f.value;
                    if (!isAncestorInSet(_this.droppedSet, n) &&
                        !isParentRemoved(_this.removes, n, _this.mirror)) {
                        pushAdd(n);
                    }
                    else if (isAncestorInSet(_this.movedSet, n)) {
                        pushAdd(n);
                    }
                    else {
                        _this.droppedSet.add(n);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
            var candidate = null;
            while (addList.length) {
                var node = null;
                if (candidate) {
                    var parentId = _this.mirror.getId(candidate.value.parentNode);
                    var nextId = getNextId(candidate.value);
                    if (parentId !== -1 && nextId !== -1) {
                        node = candidate;
                    }
                }
                if (!node) {
                    for (var index = addList.length - 1; index >= 0; index--) {
                        var _node = addList.get(index);
                        var parentId = _this.mirror.getId(_node.value.parentNode);
                        var nextId = getNextId(_node.value);
                        if (parentId !== -1 && nextId !== -1) {
                            node = _node;
                            break;
                        }
                    }
                }
                if (!node) {
                    while (addList.head) {
                        addList.removeNode(addList.head.value);
                    }
                    break;
                }
                candidate = node.previous;
                addList.removeNode(node.value);
                pushAdd(node.value);
            }
            var payload = {
                texts: _this.texts
                    .map(function (text) { return ({
                    id: _this.mirror.getId(text.node),
                    value: text.value,
                }); })
                    .filter(function (text) { return _this.mirror.has(text.id); }),
                attributes: _this.attributes
                    .map(function (attribute) { return ({
                    id: _this.mirror.getId(attribute.node),
                    attributes: attribute.attributes,
                }); })
                    .filter(function (attribute) { return _this.mirror.has(attribute.id); }),
                removes: _this.removes,
                adds: adds,
            };
            if (!payload.texts.length &&
                !payload.attributes.length &&
                !payload.removes.length &&
                !payload.adds.length) {
                return;
            }
            _this.texts = [];
            _this.attributes = [];
            _this.removes = [];
            _this.addedSet = new Set();
            _this.movedSet = new Set();
            _this.droppedSet = new Set();
            _this.movedMap = {};
            _this.emissionCallback(payload);
        };
        this.processMutation = function (m) {
            if (isIgnored(m.target)) {
                return;
            }
            switch (m.type) {
                case 'characterData': {
                    var value = m.target.textContent;
                    if (!isBlocked(m.target, _this.blockClass) && value !== m.oldValue) {
                        _this.texts.push({
                            value: needMaskingText(m.target, _this.maskTextClass, _this.maskTextSelector) && value
                                ? _this.maskTextFn
                                    ? _this.maskTextFn(value)
                                    : value.replace(/[\S]/g, '*')
                                : value,
                            node: m.target,
                        });
                    }
                    break;
                }
                case 'attributes': {
                    var target = m.target;
                    var value = m.target.getAttribute(m.attributeName);
                    if (m.attributeName === 'value') {
                        value = maskInputValue({
                            maskInputOptions: _this.maskInputOptions,
                            tagName: m.target.tagName,
                            type: m.target.getAttribute('type'),
                            value: value,
                            maskInputFn: _this.maskInputFn,
                        });
                    }
                    if (isBlocked(m.target, _this.blockClass) || value === m.oldValue) {
                        return;
                    }
                    var item = _this.attributes.find(function (a) { return a.node === m.target; });
                    if (!item) {
                        item = {
                            node: m.target,
                            attributes: {},
                        };
                        _this.attributes.push(item);
                    }
                    if (m.attributeName === 'style') {
                        var old = _this.doc.createElement('span');
                        if (m.oldValue) {
                            old.setAttribute('style', m.oldValue);
                        }
                        if (item.attributes['style'] === undefined ||
                            item.attributes['style'] === null) {
                            item.attributes['style'] = {};
                        }
                        var styleObj = item.attributes['style'];
                        for (var i = 0; i < target.style.length; i++) {
                            var pname = target.style[i];
                            var newValue = target.style.getPropertyValue(pname);
                            var newPriority = target.style.getPropertyPriority(pname);
                            if (newValue != old.style.getPropertyValue(pname) ||
                                newPriority != old.style.getPropertyPriority(pname)) {
                                if (newPriority == '') {
                                    styleObj[pname] = newValue;
                                }
                                else {
                                    styleObj[pname] = [newValue, newPriority];
                                }
                            }
                        }
                        for (var i = 0; i < old.style.length; i++) {
                            var pname = old.style[i];
                            if (target.style.getPropertyValue(pname) === '' ||
                                !target.style.getPropertyValue(pname)) {
                                styleObj[pname] = false;
                            }
                        }
                    }
                    else {
                        item.attributes[m.attributeName] = transformAttribute(_this.doc, m.target.tagName, m.attributeName, value);
                    }
                    break;
                }
                case 'childList': {
                    m.addedNodes.forEach(function (n) { return _this.genAdds(n, m.target); });
                    m.removedNodes.forEach(function (n) {
                        var nodeId = _this.mirror.getId(n);
                        var parentId = isShadowRoot(m.target)
                            ? _this.mirror.getId(m.target.host)
                            : _this.mirror.getId(m.target);
                        if (isBlocked(n, _this.blockClass) ||
                            isBlocked(m.target, _this.blockClass) ||
                            isIgnored(n)) {
                            return;
                        }
                        if (_this.addedSet.has(n)) {
                            deepDelete(_this.addedSet, n);
                            _this.droppedSet.add(n);
                        }
                        else if (_this.addedSet.has(m.target) && nodeId === -1) ;
                        else if (isAncestorRemoved(m.target, _this.mirror)) ;
                        else if (_this.movedSet.has(n) &&
                            _this.movedMap[moveKey(nodeId, parentId)]) {
                            deepDelete(_this.movedSet, n);
                        }
                        else {
                            _this.removes.push({
                                parentId: parentId,
                                id: nodeId,
                                isShadow: isShadowRoot(m.target) ? true : undefined,
                            });
                        }
                        _this.mapRemoves.push(n);
                    });
                    break;
                }
            }
        };
        this.genAdds = function (n, target) {
            if (isBlocked(n, _this.blockClass)) {
                return;
            }
            if (target && isBlocked(target, _this.blockClass)) {
                return;
            }
            if (isINode(n)) {
                if (isIgnored(n)) {
                    return;
                }
                _this.movedSet.add(n);
                var targetId = null;
                if (target && isINode(target)) {
                    targetId = target.__sn.id;
                }
                if (targetId) {
                    _this.movedMap[moveKey(n.__sn.id, targetId)] = true;
                }
            }
            else {
                _this.addedSet.add(n);
                _this.droppedSet.delete(n);
            }
            n.childNodes.forEach(function (childN) { return _this.genAdds(childN); });
        };
    }
    MutationBuffer.prototype.init = function (cb, blockClass, blockSelector, maskTextClass, maskTextSelector, inlineStylesheet, maskInputOptions, maskTextFn, maskInputFn, recordCanvas, slimDOMOptions, doc, mirror, iframeManager, shadowDomManager) {
        this.blockClass = blockClass;
        this.blockSelector = blockSelector;
        this.maskTextClass = maskTextClass;
        this.maskTextSelector = maskTextSelector;
        this.inlineStylesheet = inlineStylesheet;
        this.maskInputOptions = maskInputOptions;
        this.maskTextFn = maskTextFn;
        this.maskInputFn = maskInputFn;
        this.recordCanvas = recordCanvas;
        this.slimDOMOptions = slimDOMOptions;
        this.emissionCallback = cb;
        this.doc = doc;
        this.mirror = mirror;
        this.iframeManager = iframeManager;
        this.shadowDomManager = shadowDomManager;
    };
    MutationBuffer.prototype.freeze = function () {
        this.frozen = true;
    };
    MutationBuffer.prototype.unfreeze = function () {
        this.frozen = false;
        this.emit();
    };
    MutationBuffer.prototype.isFrozen = function () {
        return this.frozen;
    };
    MutationBuffer.prototype.lock = function () {
        this.locked = true;
    };
    MutationBuffer.prototype.unlock = function () {
        this.locked = false;
        this.emit();
    };
    return MutationBuffer;
}());
function deepDelete(addsSet, n) {
    addsSet.delete(n);
    n.childNodes.forEach(function (childN) { return deepDelete(addsSet, childN); });
}
function isParentRemoved(removes, n, mirror) {
    var parentNode = n.parentNode;
    if (!parentNode) {
        return false;
    }
    var parentId = mirror.getId(parentNode);
    if (removes.some(function (r) { return r.id === parentId; })) {
        return true;
    }
    return isParentRemoved(removes, parentNode, mirror);
}
function isAncestorInSet(set, n) {
    var parentNode = n.parentNode;
    if (!parentNode) {
        return false;
    }
    if (set.has(parentNode)) {
        return true;
    }
    return isAncestorInSet(set, parentNode);
}

var mutationBuffers = [];
function getEventTarget(event) {
    try {
        if ('composedPath' in event) {
            var path = event.composedPath();
            if (path.length) {
                return path[0];
            }
        }
        else if ('path' in event &&
            event.path.length) {
            return event.path[0];
        }
        return event.target;
    }
    catch (_a) {
        return event.target;
    }
}
function initMutationObserver(cb, doc, blockClass, blockSelector, maskTextClass, maskTextSelector, inlineStylesheet, maskInputOptions, maskTextFn, maskInputFn, recordCanvas, slimDOMOptions, mirror, iframeManager, shadowDomManager, rootEl) {
    var _a, _b, _c;
    var mutationBuffer = new MutationBuffer();
    mutationBuffers.push(mutationBuffer);
    mutationBuffer.init(cb, blockClass, blockSelector, maskTextClass, maskTextSelector, inlineStylesheet, maskInputOptions, maskTextFn, maskInputFn, recordCanvas, slimDOMOptions, doc, mirror, iframeManager, shadowDomManager);
    var mutationObserverCtor = window.MutationObserver ||
        window.__rrMutationObserver;
    var angularZoneSymbol = (_c = (_b = (_a = window) === null || _a === void 0 ? void 0 : _a.Zone) === null || _b === void 0 ? void 0 : _b.__symbol__) === null || _c === void 0 ? void 0 : _c.call(_b, 'MutationObserver');
    if (angularZoneSymbol &&
        window[angularZoneSymbol]) {
        mutationObserverCtor = window[angularZoneSymbol];
    }
    var observer = new mutationObserverCtor(mutationBuffer.processMutations.bind(mutationBuffer));
    observer.observe(rootEl, {
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true,
        childList: true,
        subtree: true,
    });
    return observer;
}
function initMoveObserver(cb, sampling, doc, mirror) {
    if (sampling.mousemove === false) {
        return function () { };
    }
    var threshold = typeof sampling.mousemove === 'number' ? sampling.mousemove : 50;
    var callbackThreshold = typeof sampling.mousemoveCallback === 'number'
        ? sampling.mousemoveCallback
        : 500;
    var positions = [];
    var timeBaseline;
    var wrappedCb = throttle(function (source) {
        var totalOffset = Date.now() - timeBaseline;
        cb(positions.map(function (p) {
            p.timeOffset -= totalOffset;
            return p;
        }), source);
        positions = [];
        timeBaseline = null;
    }, callbackThreshold);
    var updatePosition = throttle(function (evt) {
        var target = getEventTarget(evt);
        var _a = isTouchEvent(evt)
            ? evt.changedTouches[0]
            : evt, clientX = _a.clientX, clientY = _a.clientY;
        if (!timeBaseline) {
            timeBaseline = Date.now();
        }
        positions.push({
            x: clientX,
            y: clientY,
            id: mirror.getId(target),
            timeOffset: Date.now() - timeBaseline,
        });
        wrappedCb(evt instanceof DragEvent
            ? IncrementalSource.Drag
            : evt instanceof MouseEvent
                ? IncrementalSource.MouseMove
                : IncrementalSource.TouchMove);
    }, threshold, {
        trailing: false,
    });
    var handlers = [
        on('mousemove', updatePosition, doc),
        on('touchmove', updatePosition, doc),
        on('drag', updatePosition, doc),
    ];
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
function initMouseInteractionObserver(cb, doc, mirror, blockClass, sampling) {
    if (sampling.mouseInteraction === false) {
        return function () { };
    }
    var disableMap = sampling.mouseInteraction === true ||
        sampling.mouseInteraction === undefined
        ? {}
        : sampling.mouseInteraction;
    var handlers = [];
    var getHandler = function (eventKey) {
        return function (event) {
            var target = getEventTarget(event);
            if (isBlocked(target, blockClass)) {
                return;
            }
            var e = isTouchEvent(event) ? event.changedTouches[0] : event;
            if (!e) {
                return;
            }
            var id = mirror.getId(target);
            var clientX = e.clientX, clientY = e.clientY;
            cb({
                type: MouseInteractions[eventKey],
                id: id,
                x: clientX,
                y: clientY,
            });
        };
    };
    Object.keys(MouseInteractions)
        .filter(function (key) {
        return Number.isNaN(Number(key)) &&
            !key.endsWith('_Departed') &&
            disableMap[key] !== false;
    })
        .forEach(function (eventKey) {
        var eventName = eventKey.toLowerCase();
        var handler = getHandler(eventKey);
        handlers.push(on(eventName, handler, doc));
    });
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
function initScrollObserver(cb, doc, mirror, blockClass, sampling) {
    var updatePosition = throttle(function (evt) {
        var target = getEventTarget(evt);
        if (!target || isBlocked(target, blockClass)) {
            return;
        }
        var id = mirror.getId(target);
        if (target === doc) {
            var scrollEl = (doc.scrollingElement || doc.documentElement);
            cb({
                id: id,
                x: scrollEl.scrollLeft,
                y: scrollEl.scrollTop,
            });
        }
        else {
            cb({
                id: id,
                x: target.scrollLeft,
                y: target.scrollTop,
            });
        }
    }, sampling.scroll || 100);
    return on('scroll', updatePosition, doc);
}
function initViewportResizeObserver(cb) {
    var lastH = -1;
    var lastW = -1;
    var updateDimension = throttle(function () {
        var height = getWindowHeight();
        var width = getWindowWidth();
        if (lastH !== height || lastW !== width) {
            cb({
                width: Number(width),
                height: Number(height),
            });
            lastH = height;
            lastW = width;
        }
    }, 200);
    return on('resize', updateDimension, window);
}
function wrapEventWithUserTriggeredFlag(v, enable) {
    var value = __assign({}, v);
    if (!enable)
        delete value.userTriggered;
    return value;
}
var INPUT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
var lastInputValueMap = new WeakMap();
function initInputObserver(cb, doc, mirror, blockClass, ignoreClass, maskInputOptions, maskInputFn, sampling, userTriggeredOnInput) {
    function eventHandler(event) {
        var target = getEventTarget(event);
        var userTriggered = event.isTrusted;
        if (!target ||
            !target.tagName ||
            INPUT_TAGS.indexOf(target.tagName) < 0 ||
            isBlocked(target, blockClass)) {
            return;
        }
        var type = target.type;
        if (target.classList.contains(ignoreClass)) {
            return;
        }
        var text = target.value;
        var isChecked = false;
        if (type === 'radio' || type === 'checkbox') {
            isChecked = target.checked;
        }
        else if (maskInputOptions[target.tagName.toLowerCase()] ||
            maskInputOptions[type]) {
            text = maskInputValue({
                maskInputOptions: maskInputOptions,
                tagName: target.tagName,
                type: type,
                value: text,
                maskInputFn: maskInputFn,
            });
        }
        cbWithDedup(target, wrapEventWithUserTriggeredFlag({ text: text, isChecked: isChecked, userTriggered: userTriggered }, userTriggeredOnInput));
        var name = target.name;
        if (type === 'radio' && name && isChecked) {
            doc
                .querySelectorAll("input[type=\"radio\"][name=\"" + name + "\"]")
                .forEach(function (el) {
                if (el !== target) {
                    cbWithDedup(el, wrapEventWithUserTriggeredFlag({
                        text: el.value,
                        isChecked: !isChecked,
                        userTriggered: false,
                    }, userTriggeredOnInput));
                }
            });
        }
    }
    function cbWithDedup(target, v) {
        var lastInputValue = lastInputValueMap.get(target);
        if (!lastInputValue ||
            lastInputValue.text !== v.text ||
            lastInputValue.isChecked !== v.isChecked) {
            lastInputValueMap.set(target, v);
            var id = mirror.getId(target);
            cb(__assign(__assign({}, v), { id: id }));
        }
    }
    var events = sampling.input === 'last' ? ['change'] : ['input', 'change'];
    var handlers = events.map(function (eventName) { return on(eventName, eventHandler, doc); });
    var propertyDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    var hookProperties = [
        [HTMLInputElement.prototype, 'value'],
        [HTMLInputElement.prototype, 'checked'],
        [HTMLSelectElement.prototype, 'value'],
        [HTMLTextAreaElement.prototype, 'value'],
        [HTMLSelectElement.prototype, 'selectedIndex'],
    ];
    if (propertyDescriptor && propertyDescriptor.set) {
        handlers.push.apply(handlers, __spread(hookProperties.map(function (p) {
            return hookSetter(p[0], p[1], {
                set: function () {
                    eventHandler({ target: this });
                },
            });
        })));
    }
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
function initStyleSheetObserver(cb, mirror) {
    var insertRule = CSSStyleSheet.prototype.insertRule;
    CSSStyleSheet.prototype.insertRule = function (rule, index) {
        var id = mirror.getId(this.ownerNode);
        if (id !== -1) {
            cb({
                id: id,
                adds: [{ rule: rule, index: index }],
            });
        }
        return insertRule.apply(this, arguments);
    };
    var deleteRule = CSSStyleSheet.prototype.deleteRule;
    CSSStyleSheet.prototype.deleteRule = function (index) {
        var id = mirror.getId(this.ownerNode);
        if (id !== -1) {
            cb({
                id: id,
                removes: [{ index: index }],
            });
        }
        return deleteRule.apply(this, arguments);
    };
    return function () {
        CSSStyleSheet.prototype.insertRule = insertRule;
        CSSStyleSheet.prototype.deleteRule = deleteRule;
    };
}
function initMediaInteractionObserver(mediaInteractionCb, blockClass, mirror) {
    var handler = function (type) { return function (event) {
        var target = getEventTarget(event);
        if (!target || isBlocked(target, blockClass)) {
            return;
        }
        mediaInteractionCb({
            type: type,
            id: mirror.getId(target),
            currentTime: target.currentTime,
        });
    }; };
    var handlers = [
        on('play', handler(MediaInteractions.Play)),
        on('pause', handler(MediaInteractions.Pause)),
        on('seeked', handler(MediaInteractions.Seeked)),
    ];
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
function initCanvasMutationObserver(cb, blockClass, mirror) {
    var e_1, _a;
    var props = Object.getOwnPropertyNames(CanvasRenderingContext2D.prototype);
    var handlers = [];
    var _loop_1 = function (prop) {
        try {
            if (typeof CanvasRenderingContext2D.prototype[prop] !== 'function') {
                return "continue";
            }
            var restoreHandler = patch(CanvasRenderingContext2D.prototype, prop, function (original) {
                return function () {
                    var _this = this;
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (!isBlocked(this.canvas, blockClass)) {
                        setTimeout(function () {
                            var recordArgs = __spread(args);
                            if (prop === 'drawImage') {
                                if (recordArgs[0] &&
                                    recordArgs[0] instanceof HTMLCanvasElement) {
                                    var canvas = recordArgs[0];
                                    var ctx = canvas.getContext('2d');
                                    var imgd = ctx === null || ctx === void 0 ? void 0 : ctx.getImageData(0, 0, canvas.width, canvas.height);
                                    var pix = imgd === null || imgd === void 0 ? void 0 : imgd.data;
                                    recordArgs[0] = JSON.stringify(pix);
                                }
                            }
                            cb({
                                id: mirror.getId(_this.canvas),
                                property: prop,
                                args: recordArgs,
                            });
                        }, 0);
                    }
                    return original.apply(this, args);
                };
            });
            handlers.push(restoreHandler);
        }
        catch (_a) {
            var hookHandler = hookSetter(CanvasRenderingContext2D.prototype, prop, {
                set: function (v) {
                    cb({
                        id: mirror.getId(this.canvas),
                        property: prop,
                        args: [v],
                        setter: true,
                    });
                },
            });
            handlers.push(hookHandler);
        }
    };
    try {
        for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
            var prop = props_1_1.value;
            _loop_1(prop);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
function initFontObserver(cb) {
    var handlers = [];
    var fontMap = new WeakMap();
    var originalFontFace = FontFace;
    window.FontFace = function FontFace(family, source, descriptors) {
        var fontFace = new originalFontFace(family, source, descriptors);
        fontMap.set(fontFace, {
            family: family,
            buffer: typeof source !== 'string',
            descriptors: descriptors,
            fontSource: typeof source === 'string'
                ? source
                :
                    JSON.stringify(Array.from(new Uint8Array(source))),
        });
        return fontFace;
    };
    var restoreHandler = patch(document.fonts, 'add', function (original) {
        return function (fontFace) {
            setTimeout(function () {
                var p = fontMap.get(fontFace);
                if (p) {
                    cb(p);
                    fontMap.delete(fontFace);
                }
            }, 0);
            return original.apply(this, [fontFace]);
        };
    });
    handlers.push(function () {
        window.FonFace = originalFontFace;
    });
    handlers.push(restoreHandler);
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
function mergeHooks(o, hooks) {
    var mutationCb = o.mutationCb, mousemoveCb = o.mousemoveCb, mouseInteractionCb = o.mouseInteractionCb, scrollCb = o.scrollCb, viewportResizeCb = o.viewportResizeCb, inputCb = o.inputCb, mediaInteractionCb = o.mediaInteractionCb, styleSheetRuleCb = o.styleSheetRuleCb, canvasMutationCb = o.canvasMutationCb, fontCb = o.fontCb;
    o.mutationCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.mutation) {
            hooks.mutation.apply(hooks, __spread(p));
        }
        mutationCb.apply(void 0, __spread(p));
    };
    o.mousemoveCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.mousemove) {
            hooks.mousemove.apply(hooks, __spread(p));
        }
        mousemoveCb.apply(void 0, __spread(p));
    };
    o.mouseInteractionCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.mouseInteraction) {
            hooks.mouseInteraction.apply(hooks, __spread(p));
        }
        mouseInteractionCb.apply(void 0, __spread(p));
    };
    o.scrollCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.scroll) {
            hooks.scroll.apply(hooks, __spread(p));
        }
        scrollCb.apply(void 0, __spread(p));
    };
    o.viewportResizeCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.viewportResize) {
            hooks.viewportResize.apply(hooks, __spread(p));
        }
        viewportResizeCb.apply(void 0, __spread(p));
    };
    o.inputCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.input) {
            hooks.input.apply(hooks, __spread(p));
        }
        inputCb.apply(void 0, __spread(p));
    };
    o.mediaInteractionCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.mediaInteaction) {
            hooks.mediaInteaction.apply(hooks, __spread(p));
        }
        mediaInteractionCb.apply(void 0, __spread(p));
    };
    o.styleSheetRuleCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.styleSheetRule) {
            hooks.styleSheetRule.apply(hooks, __spread(p));
        }
        styleSheetRuleCb.apply(void 0, __spread(p));
    };
    o.canvasMutationCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.canvasMutation) {
            hooks.canvasMutation.apply(hooks, __spread(p));
        }
        canvasMutationCb.apply(void 0, __spread(p));
    };
    o.fontCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.font) {
            hooks.font.apply(hooks, __spread(p));
        }
        fontCb.apply(void 0, __spread(p));
    };
}
function initObservers(o, hooks) {
    var e_2, _a;
    if (hooks === void 0) { hooks = {}; }
    mergeHooks(o, hooks);
    var mutationObserver = initMutationObserver(o.mutationCb, o.doc, o.blockClass, o.blockSelector, o.maskTextClass, o.maskTextSelector, o.inlineStylesheet, o.maskInputOptions, o.maskTextFn, o.maskInputFn, o.recordCanvas, o.slimDOMOptions, o.mirror, o.iframeManager, o.shadowDomManager, o.doc);
    var mousemoveHandler = initMoveObserver(o.mousemoveCb, o.sampling, o.doc, o.mirror);
    var mouseInteractionHandler = initMouseInteractionObserver(o.mouseInteractionCb, o.doc, o.mirror, o.blockClass, o.sampling);
    var scrollHandler = initScrollObserver(o.scrollCb, o.doc, o.mirror, o.blockClass, o.sampling);
    var viewportResizeHandler = initViewportResizeObserver(o.viewportResizeCb);
    var inputHandler = initInputObserver(o.inputCb, o.doc, o.mirror, o.blockClass, o.ignoreClass, o.maskInputOptions, o.maskInputFn, o.sampling, o.userTriggeredOnInput);
    var mediaInteractionHandler = initMediaInteractionObserver(o.mediaInteractionCb, o.blockClass, o.mirror);
    var styleSheetObserver = initStyleSheetObserver(o.styleSheetRuleCb, o.mirror);
    var canvasMutationObserver = o.recordCanvas
        ? initCanvasMutationObserver(o.canvasMutationCb, o.blockClass, o.mirror)
        : function () { };
    var fontObserver = o.collectFonts ? initFontObserver(o.fontCb) : function () { };
    var pluginHandlers = [];
    try {
        for (var _b = __values(o.plugins), _c = _b.next(); !_c.done; _c = _b.next()) {
            var plugin = _c.value;
            pluginHandlers.push(plugin.observer(plugin.callback, plugin.options));
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return function () {
        mutationObserver.disconnect();
        mousemoveHandler();
        mouseInteractionHandler();
        scrollHandler();
        viewportResizeHandler();
        inputHandler();
        mediaInteractionHandler();
        styleSheetObserver();
        canvasMutationObserver();
        fontObserver();
        pluginHandlers.forEach(function (h) { return h(); });
    };
}

var IframeManager = (function () {
    function IframeManager(options) {
        this.iframes = new WeakMap();
        this.mutationCb = options.mutationCb;
    }
    IframeManager.prototype.addIframe = function (iframeEl) {
        this.iframes.set(iframeEl, true);
    };
    IframeManager.prototype.addLoadListener = function (cb) {
        this.loadListener = cb;
    };
    IframeManager.prototype.attachIframe = function (iframeEl, childSn) {
        var _a;
        this.mutationCb({
            adds: [
                {
                    parentId: iframeEl.__sn.id,
                    nextId: null,
                    node: childSn,
                },
            ],
            removes: [],
            texts: [],
            attributes: [],
            isAttachIframe: true,
        });
        (_a = this.loadListener) === null || _a === void 0 ? void 0 : _a.call(this, iframeEl);
    };
    return IframeManager;
}());

var ShadowDomManager = (function () {
    function ShadowDomManager(options) {
        this.mutationCb = options.mutationCb;
        this.scrollCb = options.scrollCb;
        this.bypassOptions = options.bypassOptions;
        this.mirror = options.mirror;
    }
    ShadowDomManager.prototype.addShadowRoot = function (shadowRoot, doc) {
        initMutationObserver(this.mutationCb, doc, this.bypassOptions.blockClass, this.bypassOptions.blockSelector, this.bypassOptions.maskTextClass, this.bypassOptions.maskTextSelector, this.bypassOptions.inlineStylesheet, this.bypassOptions.maskInputOptions, this.bypassOptions.maskTextFn, this.bypassOptions.maskInputFn, this.bypassOptions.recordCanvas, this.bypassOptions.slimDOMOptions, this.mirror, this.bypassOptions.iframeManager, this, shadowRoot);
        initScrollObserver(this.scrollCb, shadowRoot, this.mirror, this.bypassOptions.blockClass, this.bypassOptions.sampling);
    };
    return ShadowDomManager;
}());

function wrapEvent(e) {
    return __assign(__assign({}, e), { timestamp: Date.now() });
}
var wrappedEmit;
var takeFullSnapshot;
var mirror = createMirror();
function record(options) {
    if (options === void 0) { options = {}; }
    var emit = options.emit, checkoutEveryNms = options.checkoutEveryNms, checkoutEveryNth = options.checkoutEveryNth, _a = options.blockClass, blockClass = _a === void 0 ? 'rr-block' : _a, _b = options.blockSelector, blockSelector = _b === void 0 ? null : _b, _c = options.ignoreClass, ignoreClass = _c === void 0 ? 'rr-ignore' : _c, _d = options.maskTextClass, maskTextClass = _d === void 0 ? 'rr-mask' : _d, _e = options.maskTextSelector, maskTextSelector = _e === void 0 ? null : _e, _f = options.inlineStylesheet, inlineStylesheet = _f === void 0 ? true : _f, maskAllInputs = options.maskAllInputs, _maskInputOptions = options.maskInputOptions, _slimDOMOptions = options.slimDOMOptions, maskInputFn = options.maskInputFn, maskTextFn = options.maskTextFn, hooks = options.hooks, packFn = options.packFn, _g = options.sampling, sampling = _g === void 0 ? {} : _g, mousemoveWait = options.mousemoveWait, _h = options.recordCanvas, recordCanvas = _h === void 0 ? false : _h, _j = options.userTriggeredOnInput, userTriggeredOnInput = _j === void 0 ? false : _j, _k = options.collectFonts, collectFonts = _k === void 0 ? false : _k, plugins = options.plugins, _l = options.keepIframeSrcFn, keepIframeSrcFn = _l === void 0 ? function () { return false; } : _l;
    if (!emit) {
        throw new Error('emit function is required');
    }
    if (mousemoveWait !== undefined && sampling.mousemove === undefined) {
        sampling.mousemove = mousemoveWait;
    }
    var maskInputOptions = maskAllInputs === true
        ? {
            color: true,
            date: true,
            'datetime-local': true,
            email: true,
            month: true,
            number: true,
            range: true,
            search: true,
            tel: true,
            text: true,
            time: true,
            url: true,
            week: true,
            textarea: true,
            select: true,
            password: true,
        }
        : _maskInputOptions !== undefined
            ? _maskInputOptions
            : { password: true };
    var slimDOMOptions = _slimDOMOptions === true || _slimDOMOptions === 'all'
        ? {
            script: true,
            comment: true,
            headFavicon: true,
            headWhitespace: true,
            headMetaSocial: true,
            headMetaRobots: true,
            headMetaHttpEquiv: true,
            headMetaVerification: true,
            headMetaAuthorship: _slimDOMOptions === 'all',
            headMetaDescKeywords: _slimDOMOptions === 'all',
        }
        : _slimDOMOptions
            ? _slimDOMOptions
            : {};
    polyfill();
    var lastFullSnapshotEvent;
    var incrementalSnapshotCount = 0;
    wrappedEmit = function (e, isCheckout) {
        var _a;
        if (((_a = mutationBuffers[0]) === null || _a === void 0 ? void 0 : _a.isFrozen()) &&
            e.type !== EventType.FullSnapshot &&
            !(e.type === EventType.IncrementalSnapshot &&
                e.data.source === IncrementalSource.Mutation)) {
            mutationBuffers.forEach(function (buf) { return buf.unfreeze(); });
        }
        emit((packFn ? packFn(e) : e), isCheckout);
        if (e.type === EventType.FullSnapshot) {
            lastFullSnapshotEvent = e;
            incrementalSnapshotCount = 0;
        }
        else if (e.type === EventType.IncrementalSnapshot) {
            if (e.data.source === IncrementalSource.Mutation &&
                e.data.isAttachIframe) {
                return;
            }
            incrementalSnapshotCount++;
            var exceedCount = checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
            var exceedTime = checkoutEveryNms &&
                e.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
            if (exceedCount || exceedTime) {
                takeFullSnapshot(true);
            }
        }
    };
    var wrappedMutationEmit = function (m) {
        wrappedEmit(wrapEvent({
            type: EventType.IncrementalSnapshot,
            data: __assign({ source: IncrementalSource.Mutation }, m),
        }));
    };
    var wrappedScrollEmit = function (p) {
        return wrappedEmit(wrapEvent({
            type: EventType.IncrementalSnapshot,
            data: __assign({ source: IncrementalSource.Scroll }, p),
        }));
    };
    var iframeManager = new IframeManager({
        mutationCb: wrappedMutationEmit,
    });
    var shadowDomManager = new ShadowDomManager({
        mutationCb: wrappedMutationEmit,
        scrollCb: wrappedScrollEmit,
        bypassOptions: {
            blockClass: blockClass,
            blockSelector: blockSelector,
            maskTextClass: maskTextClass,
            maskTextSelector: maskTextSelector,
            inlineStylesheet: inlineStylesheet,
            maskInputOptions: maskInputOptions,
            maskTextFn: maskTextFn,
            maskInputFn: maskInputFn,
            recordCanvas: recordCanvas,
            sampling: sampling,
            slimDOMOptions: slimDOMOptions,
            iframeManager: iframeManager,
        },
        mirror: mirror,
    });
    takeFullSnapshot = function (isCheckout) {
        var _a, _b, _c, _d;
        if (isCheckout === void 0) { isCheckout = false; }
        wrappedEmit(wrapEvent({
            type: EventType.Meta,
            data: {
                href: window.location.href,
                width: getWindowWidth(),
                height: getWindowHeight(),
            },
        }), isCheckout);
        mutationBuffers.forEach(function (buf) { return buf.lock(); });
        var _e = __read(snapshot(document, {
            blockClass: blockClass,
            blockSelector: blockSelector,
            maskTextClass: maskTextClass,
            maskTextSelector: maskTextSelector,
            inlineStylesheet: inlineStylesheet,
            maskAllInputs: maskInputOptions,
            maskTextFn: maskTextFn,
            slimDOM: slimDOMOptions,
            recordCanvas: recordCanvas,
            onSerialize: function (n) {
                if (isIframeINode(n)) {
                    iframeManager.addIframe(n);
                }
                if (hasShadowRoot(n)) {
                    shadowDomManager.addShadowRoot(n.shadowRoot, document);
                }
            },
            onIframeLoad: function (iframe, childSn) {
                iframeManager.attachIframe(iframe, childSn);
            },
            keepIframeSrcFn: keepIframeSrcFn,
        }), 2), node = _e[0], idNodeMap = _e[1];
        if (!node) {
            return console.warn('Failed to snapshot the document');
        }
        mirror.map = idNodeMap;
        wrappedEmit(wrapEvent({
            type: EventType.FullSnapshot,
            data: {
                node: node,
                initialOffset: {
                    left: window.pageXOffset !== undefined
                        ? window.pageXOffset
                        : (document === null || document === void 0 ? void 0 : document.documentElement.scrollLeft) || ((_b = (_a = document === null || document === void 0 ? void 0 : document.body) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.scrollLeft) || (document === null || document === void 0 ? void 0 : document.body.scrollLeft) ||
                            0,
                    top: window.pageYOffset !== undefined
                        ? window.pageYOffset
                        : (document === null || document === void 0 ? void 0 : document.documentElement.scrollTop) || ((_d = (_c = document === null || document === void 0 ? void 0 : document.body) === null || _c === void 0 ? void 0 : _c.parentElement) === null || _d === void 0 ? void 0 : _d.scrollTop) || (document === null || document === void 0 ? void 0 : document.body.scrollTop) ||
                            0,
                },
            },
        }));
        mutationBuffers.forEach(function (buf) { return buf.unlock(); });
    };
    try {
        var handlers_1 = [];
        handlers_1.push(on('DOMContentLoaded', function () {
            wrappedEmit(wrapEvent({
                type: EventType.DomContentLoaded,
                data: {},
            }));
        }));
        var observe_1 = function (doc) {
            return initObservers({
                mutationCb: wrappedMutationEmit,
                mousemoveCb: function (positions, source) {
                    return wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: {
                            source: source,
                            positions: positions,
                        },
                    }));
                },
                mouseInteractionCb: function (d) {
                    return wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: __assign({ source: IncrementalSource.MouseInteraction }, d),
                    }));
                },
                scrollCb: wrappedScrollEmit,
                viewportResizeCb: function (d) {
                    return wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: __assign({ source: IncrementalSource.ViewportResize }, d),
                    }));
                },
                inputCb: function (v) {
                    return wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: __assign({ source: IncrementalSource.Input }, v),
                    }));
                },
                mediaInteractionCb: function (p) {
                    return wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: __assign({ source: IncrementalSource.MediaInteraction }, p),
                    }));
                },
                styleSheetRuleCb: function (r) {
                    return wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: __assign({ source: IncrementalSource.StyleSheetRule }, r),
                    }));
                },
                canvasMutationCb: function (p) {
                    return wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: __assign({ source: IncrementalSource.CanvasMutation }, p),
                    }));
                },
                fontCb: function (p) {
                    return wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: __assign({ source: IncrementalSource.Font }, p),
                    }));
                },
                blockClass: blockClass,
                ignoreClass: ignoreClass,
                maskTextClass: maskTextClass,
                maskTextSelector: maskTextSelector,
                maskInputOptions: maskInputOptions,
                inlineStylesheet: inlineStylesheet,
                sampling: sampling,
                recordCanvas: recordCanvas,
                userTriggeredOnInput: userTriggeredOnInput,
                collectFonts: collectFonts,
                doc: doc,
                maskInputFn: maskInputFn,
                maskTextFn: maskTextFn,
                blockSelector: blockSelector,
                slimDOMOptions: slimDOMOptions,
                mirror: mirror,
                iframeManager: iframeManager,
                shadowDomManager: shadowDomManager,
                plugins: (plugins === null || plugins === void 0 ? void 0 : plugins.map(function (p) { return ({
                    observer: p.observer,
                    options: p.options,
                    callback: function (payload) {
                        return wrappedEmit(wrapEvent({
                            type: EventType.Plugin,
                            data: {
                                plugin: p.name,
                                payload: payload,
                            },
                        }));
                    },
                }); })) || [],
            }, hooks);
        };
        iframeManager.addLoadListener(function (iframeEl) {
            handlers_1.push(observe_1(iframeEl.contentDocument));
        });
        var init_1 = function () {
            takeFullSnapshot();
            handlers_1.push(observe_1(document));
        };
        if (document.readyState === 'interactive' ||
            document.readyState === 'complete') {
            init_1();
        }
        else {
            handlers_1.push(on('load', function () {
                wrappedEmit(wrapEvent({
                    type: EventType.Load,
                    data: {},
                }));
                init_1();
            }, window));
        }
        return function () {
            handlers_1.forEach(function (h) { return h(); });
        };
    }
    catch (error) {
        console.warn(error);
    }
}
record.addCustomEvent = function (tag, payload) {
    if (!wrappedEmit) {
        throw new Error('please add custom event after start recording');
    }
    wrappedEmit(wrapEvent({
        type: EventType.Custom,
        data: {
            tag: tag,
            payload: payload,
        },
    }));
};
record.freezePage = function () {
    mutationBuffers.forEach(function (buf) { return buf.freeze(); });
};
record.takeFullSnapshot = function (isCheckout) {
    if (!takeFullSnapshot) {
        throw new Error('please take full snapshot after start recording');
    }
    takeFullSnapshot(isCheckout);
};
record.mirror = mirror;

module.exports = record;
