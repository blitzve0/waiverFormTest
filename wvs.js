(function (root, program) {
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return program.apply(program, arguments)('amd').WaiverWidget;
        })
    } else if (typeof module === 'object' && module.exports) {
        module.exports = exported = program()('commonjs').WaiverWidget;
    } else {
        var exported = program()('global')
        if (exported.WaiverWidget) {
            root.WaiverWidget = exported.WaiverWidget;
        } else {
            root.waiverWidget = root.WF_EMBED_WAIVER = exported.waiverWidget;
        }
    }
}(this, function () {
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
function newable(f) {
    return f;
}
function fold(init, folder, _a) {
    var head = _a[0], tail = _a.slice(1);
    return head ? fold(folder(init, head), folder, tail) : init;
}
function map(mapper, list) {
    var zero = [];
    return fold(zero, function (acc, curr) { return __spreadArrays(acc, [mapper(curr)]); }, list);
}
function foreach(executor, list) {
    var zero = undefined;
    fold(zero, function (_, curr) { return executor(curr); }, list);
}
function filter(predictor, list) {
    var zero = [];
    return fold(zero, function (acc, curr) { return predictor(curr) ? __spreadArrays(acc, [curr]) : acc; }, list);
}
function join(separator, _a) {
    var head = _a[0], tail = _a.slice(1);
    return fold(head, function (acc, curr) { return "" + acc + separator + curr; }, tail);
}
function toEntries(obj) {
    var entries = [];
    for (var key in obj)
        if (obj.hasOwnProperty(key))
            entries[entries.length] = [key, obj[key]];
    return entries;
}
function snake2dash(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}
function substituteFunction(fn, next) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var result = fn.apply(void 0, args);
        return next ? next(result) : result;
    };
}
var getWaiverConfigURL = function (templateId) {
    return 'https://s3-us-west-1.amazonaws.com/embed-waiver-config/' + templateId;
};
var getWaiverURL = function (templateId) { return '//app.waiverforever.com/pending/' + templateId; };
var defaultSignTitle = '';
var defaultSignBtnWording = 'Sign Your Waiver';
var defaultBaseColor = '#469BFF';
var defaultButtonLeftPosition = 50;
var defaultButtonRightPosition = 50;
var currentScriptURL = getCurrentScriptURL(/\/ew(\.min)?\.js/) || '';
var isMinified = /\/ew\.min\.js/.test(currentScriptURL);
var stylesheetURL = isMinified ? '//cdn.waiverforever.com/qs3/ew.min.css' : '//cdn.waiverforever.com/qs3/ew.css';
var styleSheetId = 'ewCss';
function bindDOMEvent(el, name, listener) {
    el.addEventListener(name, listener, false);
    return function () { el.removeEventListener(name, listener, false); };
}
function getWindowMode() {
    return false;
}
function getCurrentScriptURL(id) {
    var _a, _b;
    if (!document)
        return '';
    if (document.currentScript) {
        var currentScript = document.currentScript;
        var scriptURL = ((_a = currentScript.getAttribute) === null || _a === void 0 ? void 0 : _a.call(currentScript, 'src')) || currentScript.src;
        if (scriptURL)
            return scriptURL;
    }
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
        var script = scripts[i];
        var scriptURL = ((_b = script.getAttribute) === null || _b === void 0 ? void 0 : _b.call(script, 'src')) || script.src;
        if (scriptURL.search(id) > -1)
            return scriptURL || '';
    }
    return '';
}
function getQueryString(url, name) {
    var searchStr = h('a', { href: url }).search;
    var reg = new RegExp("(\\W]*)" + name + "=([\\w,]+)");
    var matched = searchStr.match(reg);
    return matched ? unescape(matched[2]) : '';
}
function removeElement(el) {
    var _a;
    (_a = el === null || el === void 0 ? void 0 : el.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(el);
}
function thenableEventHandler(eventHandler) {
    var t = substituteFunction(eventHandler);
    t.then = (function (resolve) {
        var unsubscribe = eventHandler(function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            resolve.apply(void 0, args);
            unsubscribe();
        });
    });
    return t;
}
function thenableCallback(callback, awaiter) {
    return substituteFunction(callback, function () { return ({
        then: function (resolve) {
            var unsubscribe = awaiter(function (v) {
                resolve(v);
                unsubscribe();
            });
        },
    }); });
}
function thenableConstructor(ctor, readyEvent) {
    return function Constructor() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var ins = Object.create(ctor.apply(void 0, args));
        ins.then = function (resolve) { ins[readyEvent](resolve); };
        return ins;
    };
}
function createRef() {
    var ref = function (obj) { ref.current = obj; };
    return ref;
}
function toStyle(style) {
    var styleEntries = toEntries(style);
    var standardStyles = map(function (_a) {
        var key = _a[0], value = _a[1];
        return snake2dash(key) + ":" + (typeof value === 'string' ? value : value + "px");
    }, styleEntries);
    return join(';', standardStyles);
}
var h = function createElement(tag, attributes) {
    if (attributes === void 0) { attributes = {}; }
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    var element = document.createElement(tag);
    var attributeEntries = toEntries(attributes);
    foreach(function (_a) {
        var attrName = _a[0], attribute = _a[1];
        if (attrName === 'ref' && typeof attribute === 'function') {
            attributes.ref(element);
        }
        else if (attrName === 'className' && typeof attribute === 'string') {
            element.setAttribute('class', attribute);
        }
        else if (attrName === 'style' && typeof attribute === 'object' && attribute !== null) {
            element.setAttribute(attrName, toStyle(attribute));
        }
        else if (typeof attribute === 'string') {
            element.setAttribute(attrName, attribute);
        }
    }, attributeEntries);
    foreach(function (child) {
        if (child instanceof Element) {
            element.appendChild(child);
        }
        else if (child !== undefined && child !== null) {
            element.innerText = child.toString();
        }
    }, children);
    return element;
};
function classList(el) {
    return {
        contains: function (classname) {
            var elClassname = el.className;
            if (!elClassname)
                return false;
            return elClassname.indexOf(classname) !== -1;
        },
        add: function (classname) {
            var elClassname = el.className;
            if (!elClassname)
                return el.className = classname;
            var classnames = el.className.split(' ');
            for (var i = classnames.length - 1; i >= 0; i--)
                if (classnames[i] === classname)
                    return elClassname;
            return el.className = elClassname + " " + classname;
        },
        remove: function (classname) {
            var elClassname = el.className;
            if (!elClassname)
                return '';
            var classnames = el.className.split(' ');
            for (var i = classnames.length - 1; i >= 0; i--) {
                if (classnames[i] !== classname)
                    continue;
                delete classnames[i];
                return el.className = join(' ', classnames);
            }
            return elClassname;
        },
        toggle: function (classname) {
            var elClassname = el.className;
            if (!elClassname)
                return el.className = classname;
            var classnames = el.className.split(' ');
            for (var i = classnames.length - 1; i >= 0; i--) {
                if (classnames[i] !== classname)
                    continue;
                delete classnames[i];
                return el.className = join(' ', classnames);
            }
            return el.className = elClassname + " " + classname;
        },
    };
}
function startEffect() {
    var unSubscriptions = [];
    return {
        subscribe: function (unSubscription) {
            unSubscriptions[unSubscriptions.length] = unSubscription;
            return function () { unSubscriptions = filter(function (unSub) { return unSubscription !== unSub; }, unSubscriptions); };
        },
        cleanup: function () { while (unSubscriptions.length)
            unSubscriptions.pop()(); },
    };
}
function eventEntry() {
    var callbacks = [];
    return {
        add: function (callback) {
            callbacks[callbacks.length] = callback;
            return function () { callbacks = filter(function (cb) { return callback !== cb; }, callbacks); };
        },
        trigger: function () {
            var payload = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                payload[_i] = arguments[_i];
            }
            foreach(function (callback) { return callback.apply(void 0, payload); }, callbacks);
        },
        cleanup: function () { callbacks = []; },
    };
}
function preventBubbleForKeycode(keyCode, callback) {
    return function (e) {
        var _a, _b, _c;
        if (e.keyCode === keyCode) {
            (_a = e.preventDefault) === null || _a === void 0 ? void 0 : _a.call(e);
            (_b = e.stopImmediatePropagation) === null || _b === void 0 ? void 0 : _b.call(e);
            (_c = e.stopPropagation) === null || _c === void 0 ? void 0 : _c.call(e);
            callback();
            return false;
        }
        return true;
    };
}
function fadeIn(el, option) {
    option = option || {};
    var ms = option.ms;
    var display = option.display || 'inline-block';
    var onTransitionEnd = option.onTransitionEnd;
    el.style.opacity = '0';
    el.style.visibility = 'visible';
    el.style.display = display;
    var handleEnd = function () {
        el.style.opacity = '1';
        onTransitionEnd === null || onTransitionEnd === void 0 ? void 0 : onTransitionEnd();
    };
    if (!ms)
        return handleEnd();
    var intervalMs = 50;
    var deltaOpacity = intervalMs / ms;
    var next = function (opacity) { return setTimeout(function () {
        if (!el.parentNode || opacity >= 1)
            return handleEnd();
        el.style.opacity = opacity.toString();
        next(opacity + deltaOpacity);
    }, intervalMs); };
    next(deltaOpacity);
}
function fadeOut(el, option) {
    option = option || {};
    var ms = option.ms;
    var onTransitionEnd = option.onTransitionEnd;
    var handleEnd = function () {
        el.style.opacity = '0';
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        onTransitionEnd === null || onTransitionEnd === void 0 ? void 0 : onTransitionEnd();
    };
    if (!ms)
        return handleEnd();
    var intervalMs = 50;
    var deltaOpacity = intervalMs / ms;
    var next = function (opacity) { return setTimeout(function () {
        if (!el.parentNode || opacity <= 0)
            return handleEnd();
        el.style.opacity = opacity.toString();
        next(opacity - deltaOpacity);
    }, intervalMs); };
    next(1 - deltaOpacity);
}
function insertIntoNearbyBefore(element) {
    var _a;
    var firstScriptTag = document.getElementsByTagName('script')[0];
    (_a = firstScriptTag === null || firstScriptTag === void 0 ? void 0 : firstScriptTag.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(element, firstScriptTag);
    return function () { var _a; (_a = element.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(element); };
}
function insertIntoBody(element) {
    document.body.appendChild(element);
    return function () { var _a; (_a = element.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(element); };
}
function loadStylesheet(uri, id, onload) {
    if (document.getElementById(id))
        return function () { return removeElement(document.getElementById(id)); };
    var attributes = { id: id, type: 'text/css', href: uri, rel: 'stylesheet', onload: onload };
    return insertIntoNearbyBefore(h('link', attributes));
}
function request(uri, method, body, success) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, uri);
    xhr.onload = function () {
        if (xhr.status < 200 || xhr.status >= 300 || !success)
            return;
        try {
            success(JSON.parse(xhr.response));
        }
        catch (_a) { }
    };
    xhr.send(body && JSON.stringify(body));
    return function () { xhr.abort(); };
}
function loadWaiverConfig(templateId, success) {
    return request(getWaiverConfigURL(templateId), 'GET', undefined, function (data) {
        if (!data.enabled)
            return;
        var title = data.title || defaultSignTitle;
        var signBtnWording = data.sign_btn_wording || defaultSignBtnWording;
        var baseColor = data.base_color || defaultBaseColor;
        var buttonLeftPosition = data.button_left_position === undefined
            ? defaultButtonLeftPosition
            : data.button_left_position;
        var buttonRightPosition = data.button_right_position === undefined
            ? defaultButtonRightPosition
            : data.button_right_position;
        var buttonPutOn = data.button_left_position !== undefined
            ? 'left'
            : 'right';
        success({ title: title, signBtnWording: signBtnWording, buttonPutOn: buttonPutOn, baseColor: baseColor, buttonLeftPosition: buttonLeftPosition, buttonRightPosition: buttonRightPosition });
    });
}
var WaiverWidget = function (option) {
    if (option === void 0) { option = { templateId: '' }; }
    var templateIds = [].concat(option.templateId || getQueryString(currentScriptURL, 'templateId').split(','));
    option.sdkMode = option.sdkMode || getQueryString(currentScriptURL, 'sdkMode') === 'yes';
    option.windowMode = templateIds.length > 1 ? false : (option.windowMode || (function () {
        var urlWindowMode = getQueryString(currentScriptURL, 'windowMode');
        if (urlWindowMode === 'yes')
            return true;
        if (urlWindowMode === 'no')
            return false;
        return getWindowMode();
    })());
    option.stylesheetURL = option.stylesheetURL || stylesheetURL;
    var templateIdCursor = 0;
    var templateId = templateIds[templateIdCursor++];
    var openButtonDOM;
    var closeButtonDOM;
    var modalDOM;
    var containerDOM;
    var progressBarDOM;
    var iframeDOM;
    var signed = 0;
    var isReady = false;
    var effect = startEffect();
    effect.subscribe(function () { classList(document.body).remove('wf-modal-opened'); });
    var readyEventEntry = eventEntry();
    effect.subscribe(readyEventEntry.cleanup);
    var loadEventEntry = eventEntry();
    effect.subscribe(loadEventEntry.cleanup);
    var showEventEntry = eventEntry();
    effect.subscribe(showEventEntry.cleanup);
    var closeEventEntry = eventEntry();
    effect.subscribe(closeEventEntry.cleanup);
    var signedEventEntry = eventEntry();
    effect.subscribe(signedEventEntry.cleanup);
    var destroyEventEntry = eventEntry();
    effect.subscribe(destroyEventEntry.cleanup);
    effect.subscribe(bindDOMEvent(window, 'message', function (evt) {
        var data = evt.data;
        if (data === 'CLOSE') {
            closeModal();
        }
        else if (data === 'SIGNED') {
            signed++;
            if (progressBarDOM) {
                progressBarDOM.style.width = signed / templateIds.length * 100 + "%";
            }
            signedEventEntry.trigger(signed);
            if (templateIdCursor < templateIds.length) {
                setTimeout(function () {
                    templateId = templateIds[templateIdCursor++];
                    if (iframeDOM)
                        iframeDOM.src = getWaiverURL(templateId);
                }, 1000);
            }
        }
    }));
    effect.subscribe(loadStylesheet(option.stylesheetURL, styleSheetId));
    var waiverURL = getWaiverURL(templateId);
    var openWaiverLink = function () { return window.open(waiverURL, '_blank'); };
    var toggleEventEntryAdd = function (talkback) {
        var unSubscribeShowTalkback = showEventEntry.add(function () { return talkback(true); });
        var unSubscribeCloseTalkback = closeEventEntry.add(function () { return talkback(false); });
        return function () {
            unSubscribeShowTalkback();
            unSubscribeCloseTalkback();
        };
    };
    var closeEventEntryAdd = function (talkback) {
        var unSubscribeCloseTalkback = closeEventEntry.add(function () { return talkback(signed); });
        return function () { unSubscribeCloseTalkback(); };
    };
    var waiverWidget = {
        closeEmbedWaiverModal: thenableCallback(closeModal, showEventEntry.add),
        show: thenableCallback(showModal, showEventEntry.add),
        close: thenableCallback(closeModal, closeEventEntryAdd),
        toggle: thenableCallback(toggleModal, toggleEventEntryAdd),
        destroy: thenableCallback(destroyWaiverWidget, destroyEventEntry.add),
        onShowed: thenableEventHandler(function (callback) { return showEventEntry.add(callback); }),
        onReady: thenableEventHandler(function (callback) { return readyEventEntry.add(callback); }),
        onLoad: thenableEventHandler(function (callback) { return loadEventEntry.add(callback); }),
        onSigned: thenableEventHandler(function (callback) { return signedEventEntry.add(callback); }),
        onClosed: thenableEventHandler(function (callback) { return closeEventEntry.add(callback); }),
        onDestroyed: thenableEventHandler(function (callback) { return destroyEventEntry.add(callback); }),
    };
    function triggerReadyEvent() {
        isReady = true;
        readyEventEntry.trigger(waiverWidget);
    }
    function renderButton(opt) {
        var signBtnWording = opt.signBtnWording, baseColor = opt.baseColor, buttonPutOn = opt.buttonPutOn, buttonLeftPosition = opt.buttonLeftPosition, buttonRightPosition = opt.buttonRightPosition;
        var signBtnRef = createRef();
        var button = (h("div", { id: "wf-embed-waiver-sign-btn", className: "wf-embed-waiver-sign-btn-class", style: __assign({ backgroundColor: baseColor }, (buttonPutOn === 'left' ? { left: buttonLeftPosition } : { right: buttonRightPosition })), ref: signBtnRef }, signBtnWording));
        effect.subscribe(insertIntoBody(button));
        return {
            signBtn: signBtnRef.current,
        };
    }
    function renderModal(opt) {
        var title = opt.title, baseColor = opt.baseColor;
        var modalRef = createRef();
        var containerRef = createRef();
        var iframeRef = createRef();
        var closeBtnRef = createRef();
        var progressBarRef = createRef();
        var modal = (h("div", { id: "wf-embed-waiver-modal", className: "wf-embed-waiver-better-modal", tabindex: "-1", ref: modalRef },
            h("div", { id: "wf-embed-waiver-main-container", style: { top: '101%' }, ref: containerRef },
                h("div", { id: "wf-embed-waiver-title", style: { backgroundColor: baseColor } },
                    h("span", { id: "wf-embed-waiver-title-content" }, title)),
                h("div", { id: "wf-embed-waiver-close-btn", style: { backgroundColor: baseColor }, ref: closeBtnRef }),
                h("div", { id: "wf-embed-waiver-progress" },
                    h("div", { className: "wf-embed-waiver-progress-bar", style: { backgroundColor: baseColor, width: 0 }, ref: progressBarRef })),
                h("iframe", { className: "wf-embed-waiver-better-iframe", style: { display: 'none', borderColor: baseColor }, name: "wf_embed_waiver_iframe", src: waiverURL, ref: iframeRef }))));
        effect.subscribe(insertIntoBody(modal));
        return {
            closeBtn: closeBtnRef.current,
            iframe: iframeRef.current,
            modal: modalRef.current,
            container: containerRef.current,
            progressBar: progressBarRef.current,
        };
    }
    var isShow = false;
    function triggerShowEvent() {
        showEventEntry.trigger();
        isShow = true;
    }
    function triggerCloseEvent() {
        closeEventEntry.trigger(signed);
        isShow = false;
    }
    function showModal() {
        if (!isReady)
            return;
        if (isShow)
            return;
        signed = 0;
        if (modalDOM && containerDOM && iframeDOM) {
            classList(document.body).add('wf-modal-opened');
            fadeIn(iframeDOM);
            openButtonDOM && fadeOut(openButtonDOM);
            fadeIn(modalDOM, { ms: 500, onTransitionEnd: triggerShowEvent });
            setTimeout(function () { containerDOM && (containerDOM.style.top = '0'); });
            return;
        }
        triggerShowEvent();
        openWaiverLink();
    }
    function closeModal() {
        if (!isReady)
            return;
        if (!isShow)
            return;
        if (modalDOM && containerDOM && iframeDOM) {
            classList(document.body).remove('wf-modal-opened');
            fadeOut(modalDOM, { ms: 1000, onTransitionEnd: triggerCloseEvent });
            openButtonDOM && fadeIn(openButtonDOM, { ms: 1000 });
            setTimeout(function () { containerDOM && (containerDOM.style.top = '101%'); });
        }
    }
    function toggleModal() {
        if (!isReady)
            return;
        isShow ? closeModal() : showModal();
    }
    function destroyWaiverWidget() {
        if (!isReady)
            return;
        isReady = false;
        destroyEventEntry.trigger();
        effect.cleanup();
    }
    loadWaiverConfig(templateId, function (configData) {
        var title = configData.title, baseColor = configData.baseColor;
        if (option.windowMode && option.sdkMode) {
            triggerReadyEvent();
        }
        else if (!option.windowMode && !option.sdkMode) {
            var modalRefs = renderModal({ title: title, baseColor: baseColor });
            modalDOM = modalRefs.modal;
            containerDOM = modalRefs.container;
            iframeDOM = modalRefs.iframe;
            closeButtonDOM = modalRefs.closeBtn;
            progressBarDOM = modalRefs.progressBar;
            var buttonRefs = renderButton(configData);
            openButtonDOM = buttonRefs.signBtn;
            fadeOut(buttonRefs.signBtn);
            effect.subscribe(bindDOMEvent(modalRefs.iframe, 'load', function () {
                if (!signed) {
                    openButtonDOM && fadeIn(openButtonDOM);
                    triggerReadyEvent();
                }
                loadEventEntry.trigger(signed);
            }));
        }
        else if (option.windowMode && !option.sdkMode) {
            var buttonRefs = renderButton(configData);
            openButtonDOM = buttonRefs.signBtn;
            openButtonDOM && fadeIn(openButtonDOM);
            triggerReadyEvent();
        }
        else {
            var modalRefs = renderModal({ title: title, baseColor: baseColor });
            modalDOM = modalRefs.modal;
            containerDOM = modalRefs.container;
            iframeDOM = modalRefs.iframe;
            closeButtonDOM = modalRefs.closeBtn;
            effect.subscribe(bindDOMEvent(modalRefs.iframe, 'load', function () {
                loadEventEntry.trigger(signed);
            }));
            triggerReadyEvent();
        }
        {
            modalDOM && effect.subscribe(bindDOMEvent(modalDOM, 'keydown', preventBubbleForKeycode(27, closeModal)));
            openButtonDOM && effect.subscribe(bindDOMEvent(openButtonDOM, 'click', showModal));
            closeButtonDOM && effect.subscribe(bindDOMEvent(closeButtonDOM, 'click', closeModal));
        }
    });
    return waiverWidget;
};
var WaiverWidgetConstructor = newable(thenableConstructor(WaiverWidget, 'onReady'));
var UMDFactory = function (type) {
    if (type === 'amd' || type === 'commonjs' || getQueryString(currentScriptURL, 'templateId') === '') {
        return { WaiverWidget: WaiverWidgetConstructor };
    }
    else {
        return { waiverWidget: new WaiverWidgetConstructor() };
    }
};

return UMDFactory;
}));
