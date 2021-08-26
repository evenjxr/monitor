import { initMutationObserver, initScrollObserver } from './observer.js';

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

export { ShadowDomManager };
