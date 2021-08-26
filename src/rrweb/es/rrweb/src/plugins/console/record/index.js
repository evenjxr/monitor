import { __values, __spread } from '../../../../ext/tslib/tslib.es6.js';
import { patch } from '../../../utils.js';
import { stringify } from './stringify.js';
import { ErrorStackParser } from './error-stack-parser.js';

var defaultLogOptions = {
    level: [
        'assert',
        'clear',
        'count',
        'countReset',
        'debug',
        'dir',
        'dirxml',
        'error',
        'group',
        'groupCollapsed',
        'groupEnd',
        'info',
        'log',
        'table',
        'time',
        'timeEnd',
        'timeLog',
        'trace',
        'warn',
    ],
    lengthThreshold: 1000,
    logger: console,
};
function initLogObserver(cb, logOptions) {
    var e_1, _a;
    var _this = this;
    var logger = logOptions.logger;
    if (!logger) {
        return function () { };
    }
    var logCount = 0;
    var cancelHandlers = [];
    if (logOptions.level.includes('error')) {
        if (window) {
            var originalOnError_1 = window.onerror;
            window.onerror = function (msg, file, line, col, error) {
                if (originalOnError_1) {
                    originalOnError_1.apply(_this, [msg, file, line, col, error]);
                }
                var trace = ErrorStackParser.parse(error).map(function (stackFrame) { return stackFrame.toString(); });
                var payload = [stringify(msg, logOptions.stringifyOptions)];
                cb({
                    level: 'error',
                    trace: trace,
                    payload: payload,
                });
            };
            cancelHandlers.push(function () {
                window.onerror = originalOnError_1;
            });
        }
    }
    try {
        for (var _b = __values(logOptions.level), _c = _b.next(); !_c.done; _c = _b.next()) {
            var levelType = _c.value;
            cancelHandlers.push(replace(logger, levelType));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return function () {
        cancelHandlers.forEach(function (h) { return h(); });
    };
    function replace(_logger, level) {
        var _this = this;
        if (!_logger[level]) {
            return function () { };
        }
        return patch(_logger, level, function (original) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                original.apply(_this, args);
                try {
                    var trace = ErrorStackParser.parse(new Error())
                        .map(function (stackFrame) { return stackFrame.toString(); })
                        .splice(1);
                    var payload = args.map(function (s) {
                        return stringify(s, logOptions.stringifyOptions);
                    });
                    logCount++;
                    if (logCount < logOptions.lengthThreshold) {
                        cb({
                            level: level,
                            trace: trace,
                            payload: payload,
                        });
                    }
                    else if (logCount === logOptions.lengthThreshold) {
                        cb({
                            level: 'warn',
                            trace: [],
                            payload: [
                                stringify('The number of log records reached the threshold.'),
                            ],
                        });
                    }
                }
                catch (error) {
                    original.apply(void 0, __spread(['rrweb logger error:', error], args));
                }
            };
        });
    }
}
var PLUGIN_NAME = 'rrweb/console@1';
var getRecordConsolePlugin = function (options) { return ({
    name: PLUGIN_NAME,
    observer: initLogObserver,
    options: options
        ? Object.assign({}, defaultLogOptions, options)
        : defaultLogOptions,
}); };

export { PLUGIN_NAME, getRecordConsolePlugin };
