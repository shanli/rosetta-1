(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var plainDom = {
    content: 'content',
    a: 'a',
    abbr: 'abbr',
    address: 'address',
    area: 'area',
    article: 'article',
    aside: 'aside',
    audio: 'audio',
    b: 'b',
    base: 'base',
    bdi: 'bdi',
    bdo: 'bdo',
    big: 'big',
    blockquote: 'blockquote',
    body: 'body',
    br: 'br',
    button: 'button',
    canvas: 'canvas',
    caption: 'caption',
    cite: 'cite',
    code: 'code',
    col: 'col',
    colgroup: 'colgroup',
    data: 'data',
    datalist: 'datalist',
    dd: 'dd',
    del: 'del',
    details: 'details',
    dfn: 'dfn',
    dialog: 'dialog',
    div: 'div',
    dl: 'dl',
    dt: 'dt',
    em: 'em',
    embed: 'embed',
    fieldset: 'fieldset',
    figcaption: 'figcaption',
    figure: 'figure',
    footer: 'footer',
    form: 'form',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    head: 'head',
    header: 'header',
    hgroup: 'hgroup',
    hr: 'hr',
    html: 'html',
    i: 'i',
    iframe: 'iframe',
    img: 'img',
    input: 'input',
    ins: 'ins',
    kbd: 'kbd',
    keygen: 'keygen',
    label: 'label',
    legend: 'legend',
    li: 'li',
    link: 'link',
    main: 'main',
    map: 'map',
    mark: 'mark',
    menu: 'menu',
    menuitem: 'menuitem',
    meta: 'meta',
    meter: 'meter',
    nav: 'nav',
    noscript: 'noscript',
    object: 'object',
    ol: 'ol',
    optgroup: 'optgroup',
    option: 'option',
    output: 'output',
    p: 'p',
    param: 'param',
    picture: 'picture',
    pre: 'pre',
    progress: 'progress',
    q: 'q',
    rp: 'rp',
    rt: 'rt',
    ruby: 'ruby',
    s: 's',
    samp: 'samp',
    script: 'script',
    section: 'section',
    select: 'select',
    small: 'small',
    source: 'source',
    span: 'span',
    strong: 'strong',
    style: 'style',
    sub: 'sub',
    summary: 'summary',
    sup: 'sup',
    table: 'table',
    tbody: 'tbody',
    td: 'td',
    textarea: 'textarea',
    tfoot: 'tfoot',
    th: 'th',
    thead: 'thead',
    time: 'time',
    title: 'title',
    tr: 'tr',
    track: 'track',
    u: 'u',
    ul: 'ul',
    'var': 'var',
    video: 'video',
    wbr: 'wbr',

    // SVG
    circle: 'circle',
    clipPath: 'clipPath',
    defs: 'defs',
    ellipse: 'ellipse',
    g: 'g',
    line: 'line',
    linearGradient: 'linearGradient',
    mask: 'mask',
    path: 'path',
    pattern: 'pattern',
    polygon: 'polygon',
    polyline: 'polyline',
    radialGradient: 'radialGradient',
    rect: 'rect',
    stop: 'stop',
    svg: 'svg',
    text: 'text',
    tspan: 'tspan'
};

module.exports = plainDom;
},{}],2:[function(require,module,exports){
var supportEvent = require('./supportEvent.js'),
    utils = require('./utils.js'),
    query = utils.query,
    toType = utils.toType,
    objToString = utils.objToString,
    extend = utils.extend,
    toPlainArray = utils.toPlainArray,
    isOriginalTag = utils.isOriginalTag,
    isDomNode = utils.isDomNode,
    isString = utils.isString,
    isFunction = utils.isFunction,

    ATTACHED = 'attached',
    DETACHED = 'detached',
    CREATED = 'created',
    ATTRIBUTECHANGE = 'attributeChange',
    refers = {},
    _elemClass = {},
    allRendered = false;


function bind(type, listener, context, ifOnce) {
    this.events = this.events || {};
    var queue = this.events[type] || (this.events[type] = []);
    queue.push({
        f: listener,
        o: context,
        ifOnce: ifOnce
    });
}

function fire(type) {
    this.events = this.events || {};
    var slice = [].slice,
        list = this.events[type];

    if (!list) {
        return;
    }

    var arg = slice.call(arguments, 1);
    for (var i = 0, j = list.length; i < j; i++) {
        var cb = list[i];
        if (cb.f.apply(cb.o, arg) === false) {
            break;
        }

        if (cb.ifOnce === true) {
            list.splice(i, 1);
            i--;
            j--;
        }
    }
}


function createElemClass(type, renderFunc) {
    function update(options) {
        // extend(this.attrs, options, true);
        var children = this.children,
            attrs = this.root.attributes,
            root = this.root,
            type = this.type,
            attr = {};

        for (var n = 0; n < attrs.length; n++) {
            var item = attrs[n];
            attr[item.name] = item.nodeValue;
        }

        extend(attr, options, true);
        Rosetta.render(Rosetta.create(type, attr, children), root, true);
        this.trigger(ATTRIBUTECHANGE, this);
    }

    function destroy() {
        this.off();
        this.root.remove();
        delete ref(this.name);
        this.trigger(DETACHED, this);
    }

    function on(type, listener, context, ifOnce) {
        bind.call(this, type, listener, context, ifOnce);
    }

    function trigger(type) {
        fire.call(this, type);
    }

    function off(type) {
        if (!type) {
            this.events = [];
        }

        delete this.events[type];
    }

    function once(type, listener, context) {
        this.on(type, listener, context, true);
    }


    function create(type, attr) {
        var obj = Rosetta.create.apply(Rosetta, arguments);
        if (!!attr && !!attr.ref) {
            if (obj.isRosettaElem == true) {
                this.refs[attr.ref] = obj.root;
            } else if (isDomNode(obj)) {
                this.refs[attr.ref] = obj;
            }
        }

        return obj;
    }
    return (function(type, renderFunc) {
        function CustomElement(options) {
            extend(this, {
                type: type,

                name: name,

                renderFunc: renderFunc,

                refs: {},

                events: {},

                isAttached: false,

                attrs: {}
            }, options || {}, true);
        }

        CustomElement.prototype = {
            update: update,

            destroy: destroy,

            isRosettaElem: true,

            on: on,

            trigger: trigger,

            off: off,

            once: once,

            create: create

        };

        return CustomElement;

    })(type, renderFunc);
}


function init() {
    allRendered = false;
    var elems = query('.r-element');
    for (var i = 0; i < elems.length; i++) {
        var item = elems[i],
            type = item.tagName.toLowerCase(),
            attrs = item.attributes,
            options = {};

        if (type.indexOf('r-') == 0) {
            var children = item.children,
                childrenArr = [].slice.call(children);

            for (var n = 0; n < attrs.length; n++) {
                var attr = attrs[n];
                options[attr.name] = attr.nodeValue;
            }

            var root = Rosetta.render(Rosetta.create(type, options, childrenArr), item, true),
                newClass = (root.getAttribute('class') || '')? (root.getAttribute('class') || '') + ' ' + type : type;

            root.setAttribute('class', newClass);
            show.call(root);
        }
    }
    allRendered = true;
    fire.call(Rosetta, 'ready');
}

function defaultDisplay(nodeName) {
    var element, display;
    var elementDisplay = {};
    if (!elementDisplay[nodeName]) {
        element = document.createElement(nodeName);
        document.body.appendChild(element);
        display = getComputedStyle(element, '').getPropertyValue("display");
        element.parentNode.removeChild(element);
        display == "none" && (display = "block");
        elementDisplay[nodeName] = display;
    }
    return elementDisplay[nodeName];
}

function show () {
    this.style.display == "none" && (this.style.display = '');
    if (getComputedStyle(this, '').getPropertyValue("display") == "none") {
        this.style.display = defaultDisplay(this.nodeName)
    }
}

function replaceContent(obj) {
    obj.holder = {};
    var contents = query('content', obj.root);

    for (var i = 0; i < contents.length; i++) {
        var item = contents[i];
        obj.holder[item.getAttribute('selector')] = item;
    }

    // deal with content
    var tmp = document.createDocumentFragment();
    if (obj.children && obj.children.length > 0) {
        for (var i = 0; i < obj.children.length; i++) {
            var item = obj.children[i];

            tmp.appendChild(item);
        }

        for (var i in obj.holder) {
            var dom = obj.holder[i];
            var newDom = query(i, tmp);
            if (newDom.length > 0) {
                var container = document.createElement('div');
                container.setAttribute('class', 'content');
                container.setAttribute('selector', i);
                dom.parentElement.replaceChild(container, dom);
                for (var j = 0; j < newDom.length; j++) {
                    container.appendChild(newDom[j]);
                }
            } else {
                dom.parentElement.removeChild(dom);
            }
        }
    }
}

function ref(key, value) {
    if (value) {
        refers[key] = value;
    } else {
        return refers[key];
    }
}

function getElemClass(type) {
    return _elemClass[type];
}

function addElemClass(type, elemClass) {
    _elemClass[type] = elemClass
}

function addElem(name, elemObj) {
    refers[name] = elemObj;
}

function render(obj, root, force) {
    if (isString(root)) {
        root = query(root)[0];
    }

    if (!obj) {
        return;
    }

    if (obj.isRosettaElem == true) {
        obj.root = obj.__t(obj, obj.attrs, obj.ref);

        replaceContent(obj);
    } else if (isDomNode(obj)) {
        obj.root = obj;
    }

    for (var i in obj.attrs) {
        var item = obj.attrs[i];
        if (!supportEvent[i]) {
            if (!!item) {
                if (!isString(item)) {
                    item = objToString(item);
                }
                obj.root.setAttribute(i, item);
            }
        } else {
            obj.root.addEventListener(supportEvent[i], item, false);
        }
    }

    if ((isDomNode(root) && root.getAttribute('type') == 'r-element') || force == true) {
        root.parentElement.replaceChild(obj.root, root);
        obj.trigger(ATTACHED, obj);
        obj.isAttached = true;
        return obj.root;
    } else {
        if (root.isRosettaElem == true) {
            root.children = root.children || [];

            root.children.push(obj);
        } else {
            if (obj.root) {
                root.appendChild(obj.root);
            } else {
                root.innerHTML = obj;
            }

        }
    }
}

// create的trigger之前执行renderfunc
function create(type, attr) {
    var children = [].slice.call(arguments, 2),
        children = toPlainArray(children),
        result = null;

    attr = toType(attr || '') || {};

    if (isString(type)) {
        if (isOriginalTag(type)) {
            var node = document.createElement(type);
            node.attrs = attr;

            result = node;

        } else {
            var NewClass = getElemClass(type),
                elemObj = null;

            if (!!NewClass) {
                elemObj = new NewClass();
            }

            result = elemObj;
        }

        if (!!result) {
            for (var i = 0; i < children.length; i++) {
                var item = children[i];
                // content的判断

                render(item, result);
            }
        }

        if (isString(type) && !isOriginalTag(type)) {
            elemObj.renderFunc(elemObj);
            elemObj.name = attr.ref ? attr.ref : '';
            if (!!attr.ref) {
                addElem(attr.ref, elemObj);
            }

            extend(elemObj.attrs, attr, true);

            elemObj.trigger(CREATED, elemObj);
        }

        return result;
    }

}

function register(type, renderFunc) {
    var elemClass = createElemClass(type, renderFunc);
    addElemClass(type, elemClass);
    return elemClass;
}

function ready(cb) {
    if (isFunction(cb)) {
        if (allRendered == true) {
            cb();
        } else {
            bind.call(Rosetta, 'ready', cb);
        }
    }
}

var Rosetta = {
    init: init,

    ref: ref,

    getElemClass: getElemClass,

    addElemClass: addElemClass,

    addElem: addElem,

    render: render,

    create: create,

    register: register,

    ready: ready
};

module.exports = Rosetta;



},{"./supportEvent.js":3,"./utils.js":4}],3:[function(require,module,exports){
var supportEvent = {
    // 只支持原生的
    onClick: 'click',
    onDoubleClick: 'doubleclick',
    onDrag: 'drag',
    onDragEnd: 'dragend',
    onDragEnter: 'dragenter',
    onDragExit: 'dragexit',
    onDragLeave: 'dragleave',
    onDragOver: 'dragover',
    onDragStart: 'dragstart',
    onDrop: 'drop',
    onMouseDown: 'mousedown',
    onMouseEnter: 'mouseenter',
    onMouseLeave: 'mouseleave',
    onMouseMove: 'mousemove',
    onMouseOut: 'mouseout',
    onMouseOver: 'mouseover',
    onMouseUp: 'mouseup',


    onTouchStart: 'touchstart',
    onTouchEnd: 'touchend',
    onTouchCancel: 'touchcancel',
    onTouchMove: 'touchmove',


    onScroll: 'scroll',
    onWheel: 'wheel',


    onCopy: 'copy',
    onCut: 'cut',
    onPaste: 'paste',


    onKeyDown: 'keydown',
    onKeyPress: 'keypress',
    onKeyUp: 'keyup',


    onFocus: 'focus',
    onBlur: 'blur',


    onChange: 'change',
    onInput: 'input',
    onSubmit: 'submit'
};

module.exports = supportEvent;
},{}],4:[function(require,module,exports){
var plainDom = require('./plainDom.js'),

    isString = module.exports.isString = function(elem) {
        return typeof elem == 'string';
    },

    isDomNode = module.exports.isDomNode = function(elem) {
        return !!(elem && elem.nodeType === 1);
    },

    isOriginalTag = module.exports.isOriginalTag = function(str) {
        return !!plainDom[str];
    },

    isWindow = module.exports.isWindow = function(obj) {
        return obj != null && obj == obj.window;
    },

    isPlainObject = module.exports.isPlainObject = function(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
    },

    isArray = module.exports.isArray = function(value) {
        return value instanceof Array;
    },

    isObject = module.exports.isObject = function(value) {
        return typeof value == 'object';
    },

    isFunction = module.exports.isFunction = function(obj) {
        return typeof obj == 'function' || false;
    }

    extend = module.exports.extend = function(target) {
        var end = [].slice.call(arguments, arguments.length - 2),
            deep = false,
            params = null;

        target = target || {};

        if (end === true) {
            deep = true;
            params = [].slice.call(arguments, 1, arguments.length - 2);
        } else {
            params = [].slice.call(arguments, 1);
        }

        params.map(function(source, index) {
            for (key in source) {
                if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                    if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                        target[key] = {};
                    }

                    if (isArray(source[key]) && !isArray(target[key])) {
                        target[key] = [];
                    }

                    extend(target[key], source[key], deep);
                } else if (source[key] !== undefined) {
                    target[key] = source[key];
                }
            }
        });

        return target;
    },

    camelize = module.exports.camelize = function(key) {
        var _reg = /-(.)/g;
        return key.replace(_reg, function(_, txt) {
            return txt.toUpperCase();
        });
    },

    toPlainArray = module.exports.toPlainArray = function(data, result) {
        if (!result) {
            var result = [];
        }

        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            if (isArray(item)) {
                toPlainArray(item, result);
            } else {
                result.push(item);
            }
        }

        return result;
    },

    query = module.exports.query = function(selector, element) {
        var found,
            maybeID = selector[0] == '#',
            maybeClass = !maybeID && selector[0] == '.',
            slice = [].slice,
            nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
            simpleSelectorRE = /^[\w-]*$/,
            isSimple = simpleSelectorRE.test(nameOnly);

        if (!element) {
            element = document;
        }

        return (element.getElementById && isSimple && maybeID) ?
            ((found = element.getElementById(nameOnly)) ? [found] : []) :
            (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
            slice.call(
                isSimple && !maybeID && element.getElementsByClassName ?
                maybeClass ? element.getElementsByClassName(nameOnly) :
                element.getElementsByTagName(selector) :
                element.querySelectorAll(selector)
            );
    },

    toType = module.exports.toType = function(attr) {
        var value = null;

        try {
            value = eval(attr);

            if (isArray(value)) {
                value.map(function(item, index) {
                    value[index] = toType(item);
                });
            } else {
                for (var i in value) {
                    var v = value[i];
                    value[i] = toType(v);
                }
            }
        } catch (e) {
            value = attr;
        }

        return value;
    },

    objToString = module.exports.objToString = function(obj, indeep) {
        switch (typeof obj) {
            case "string":
                return "'" + obj + "'";
            case "function":
                return obj.name || obj.toString();
            case "object":
                var indent = Array(indeep || 1).join('\t'),
                    isArray = Array.isArray(obj);
                return ('{[' [+isArray] + Object.keys(obj).map(function(key) {
                    return '\n\t' + indent + (isArray ? '' : key + ': ') + objToString(obj[key], (indeep || 1) + 1);
                }).join(',') + '\n' + indent + '}]' [+isArray]).replace(/[\s\t\n]+(?=(?:[^\'"]*[\'"][^\'"]*[\'"])*[^\'"]*$)/g, '');
            default:
                return obj.toString();
        }
    };

},{"./plainDom.js":1}],5:[function(require,module,exports){
var Rosetta = require('./lib/rosetta.js'),

    readyRE = /complete/,
    ready = function(callback) {
        if (readyRE.test(document.readyState) && document.body) {
            callback();
        } else {
            if (!document.addEventListener) {
                window.attachEvent('onload', callback);
            } else {
                document.addEventListener('DOMContentLoaded', function() {
                    callback();
                }, false);
            }
        }
    };

window.Rosetta = Rosetta;

ready(Rosetta.init);
},{"./lib/rosetta.js":2}]},{},[5]);
