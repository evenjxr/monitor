function pathToSelector(node) {
    if (!node || !node.outerHTML) {
        return '';
    }
    var path = '';
    while (node.parentElement) {
        var name = node.localName;
        if (!name) {
            break;
        }
        name = name.toLowerCase();
        var parent = node.parentElement;
        var domSiblings = [];
        if (parent.children && parent.children.length > 0) {
            for (var i = 0; i < parent.children.length; i++) {
                var sibling = parent.children[i];
                if (sibling.localName && sibling.localName.toLowerCase) {
                    if (sibling.localName.toLowerCase() === name) {
                        domSiblings.push(sibling);
                    }
                }
            }
        }
        if (domSiblings.length > 1) {
            name += ':eq(' + domSiblings.indexOf(node) + ')';
        }
        path = name + (path ? '>' + path : '');
        node = parent;
    }
    return path;
}
function stringify(obj, stringifyOptions) {
    var options = {
        numOfKeysLimit: 50,
    };
    Object.assign(options, stringifyOptions);
    var stack = [];
    var keys = [];
    return JSON.stringify(obj, function (key, value) {
        if (stack.length > 0) {
            var thisPos = stack.indexOf(this);
            ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
            ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
            if (~stack.indexOf(value)) {
                if (stack[0] === value) {
                    value = '[Circular ~]';
                }
                else {
                    value =
                        '[Circular ~.' +
                            keys.slice(0, stack.indexOf(value)).join('.') +
                            ']';
                }
            }
        }
        else {
            stack.push(value);
        }
        if (value === null || value === undefined) {
            return value;
        }
        if (shouldToString(value)) {
            return toString(value);
        }
        if (value instanceof Event) {
            var eventResult = {};
            for (var eventKey in value) {
                var eventValue = value[eventKey];
                if (Array.isArray(eventValue)) {
                    eventResult[eventKey] = pathToSelector(eventValue.length ? eventValue[0] : null);
                }
                else {
                    eventResult[eventKey] = eventValue;
                }
            }
            return eventResult;
        }
        else if (value instanceof Node) {
            if (value instanceof HTMLElement) {
                return value ? value.outerHTML : '';
            }
            return value.nodeName;
        }
        return value;
    });
    function shouldToString(_obj) {
        if (typeof _obj === 'object' &&
            Object.keys(_obj).length > options.numOfKeysLimit) {
            return true;
        }
        if (typeof _obj === 'function') {
            return true;
        }
        return false;
    }
    function toString(_obj) {
        var str = _obj.toString();
        if (options.stringLengthLimit && str.length > options.stringLengthLimit) {
            str = str.slice(0, options.stringLengthLimit) + "...";
        }
        return str;
    }
}

export { stringify };
