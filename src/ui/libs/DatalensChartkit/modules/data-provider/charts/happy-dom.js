/*! For license information please see happy-dom.js.LICENSE.txt */
/* eslint-disable */
(() => {
    var e = {
            904: (e, t) => {
                function n(e) {
                    this.cssText = e;
                }
                (t.d = n),
                    (n.prototype = {
                        get cssText() {
                            return Object.keys(this)
                                .map(function (e) {
                                    return (
                                        ('cssFloat' === e
                                            ? 'float:'
                                            : e.replace(/[A-Z]/g, '-$&').toLowerCase() + ':') +
                                        this[e]
                                    );
                                }, this)
                                .join(';');
                        },
                        set cssText(e) {
                            for (
                                var t,
                                    n =
                                        /(?:^|;)\s*([-a-z]+)\s*:((?:("|')(?:\\.|(?!\3)[^\\])*?\3|[^"';])+)(?=;|$)/gi;
                                (t = n.exec(e));

                            )
                                this[
                                    'float' === t[1]
                                        ? 'cssFloat'
                                        : ((r = t[1]),
                                          r.replace(/-([a-z])/g, function (e, t) {
                                              return t.toUpperCase();
                                          }))
                                ] = t[2].trim();
                            var r;
                        },
                    });
            },
            439: (e, t, n) => {
                var r = {
                        async: 1,
                        autoplay: 1,
                        loop: 1,
                        checked: 1,
                        defer: 1,
                        disabled: 1,
                        muted: 1,
                        multiple: 1,
                        nomodule: 1,
                        playsinline: 1,
                        readonly: 1,
                        required: 1,
                        selected: 1,
                    },
                    i = {
                        'form method get': 1,
                        'input type text': 1,
                        'script type text/javascript': 1,
                        'style type text/css': 1,
                    },
                    o = {
                        AREA: 1,
                        BASE: 1,
                        BR: 1,
                        COL: 1,
                        EMBED: 1,
                        HR: 1,
                        IMG: 1,
                        INPUT: 1,
                        KEYGEN: 1,
                        LINK: 1,
                        MENUITEM: 1,
                        META: 1,
                        PARAM: 1,
                        SOURCE: 1,
                        TRACK: 1,
                        WBR: 1,
                    },
                    s = {SCRIPT: /<(?=\/script)/i, STYLE: /<(?=\/style)/i},
                    a = {SCRIPT: /<(?=\/script|!--)/gi, STYLE: /<(?=\/style|!--)/gi},
                    l = o.hasOwnProperty,
                    c = n(904).d,
                    u = n(410),
                    d = {
                        ELEMENT_NODE: 1,
                        TEXT_NODE: 3,
                        PROCESSING_INSTRUCTION_NODE: 7,
                        COMMENT_NODE: 8,
                        DOCUMENT_NODE: 9,
                        DOCUMENT_TYPE_NODE: 10,
                        DOCUMENT_FRAGMENT_NODE: 11,
                        nodeName: null,
                        parentNode: null,
                        ownerDocument: null,
                        childNodes: null,
                        get nodeValue() {
                            return 3 === this.nodeType || 8 === this.nodeType ? this.data : null;
                        },
                        set nodeValue(e) {
                            (3 !== this.nodeType && 8 !== this.nodeType) || (this.data = e);
                        },
                        get textContent() {
                            return 3 === this.nodeType || 8 === this.nodeType
                                ? this.data
                                : this.childNodes
                                      .map(function (e) {
                                          return e.textContent;
                                      })
                                      .join('');
                        },
                        set textContent(e) {
                            3 === this.nodeType || 8 === this.nodeType
                                ? (this.data = e)
                                : I.call(
                                      this,
                                      this.ownerDocument.createTextNode(
                                          a[this.tagName] ? e.replace(a[this.tagName], '<\\') : e,
                                      ),
                                  );
                        },
                        get firstChild() {
                            return (this.childNodes && this.childNodes[0]) || null;
                        },
                        get lastChild() {
                            return (
                                (this.childNodes && this.childNodes[this.childNodes.length - 1]) ||
                                null
                            );
                        },
                        get nextSibling() {
                            return j(this, 1, 0);
                        },
                        get previousSibling() {
                            return j(this, -1, 0);
                        },
                        get innerHTML() {
                            return d.toString.call(this);
                        },
                        set innerHTML(e) {
                            for (
                                var t,
                                    n,
                                    r,
                                    i,
                                    a = this,
                                    l = a.ownerDocument || a,
                                    c =
                                        /<(!--([\s\S]*?)--!?|!\[CDATA\[([\s\S]*?)\]\]|[?!][\s\S]*?)>|<(\/?)([^ \/>]+)((?:("|')(?:\\\7|[\s\S])*?\7|[^>])*?)(\/?)>|[^<]+|</g,
                                    u =
                                        /([^=\s]+)(?:\s*=\s*(("|')((?:\\\3|[\s\S])*?)\3|[^\s"'`=<>]+)|)/g,
                                    d = l.createDocumentFragment(),
                                    h = d;
                                (n = c.exec(e));

                            )
                                if (n[4]) h = h.parentNode || h;
                                else if (n[5])
                                    if (
                                        ((t =
                                            'text/html' === l.contentType
                                                ? l.createElement(n[5])
                                                : l.createElementNS(null, n[5])),
                                        n[6] && n[6].replace(u, p),
                                        h.appendChild(t),
                                        (r = s[t.tagName]))
                                    ) {
                                        for (
                                            i = '';
                                            (n = c.exec(e)) && !r.test(n[0]);
                                            i += n[3] || n[0]
                                        );
                                        if (((t.textContent = i.replace(m, v)), !n)) break;
                                    } else o[t.tagName] || n[8] || (h = t);
                                else
                                    h.appendChild(
                                        n[2]
                                            ? l.createComment(n[2].replace(m, v))
                                            : n[1]
                                              ? l.createDocumentType(n[1])
                                              : l.createTextNode(n[0].replace(m, v)),
                                    );
                            function p(e, n, r, i, o) {
                                t.setAttribute(n, (i ? o : r || '').replace(m, v));
                            }
                            I.call(a, d);
                        },
                        get outerHTML() {
                            return this.toString();
                        },
                        set outerHTML(e) {
                            var t = this.ownerDocument.createDocumentFragment();
                            (t.innerHTML = e), this.parentNode.replaceChild(t, this);
                        },
                        get style() {
                            return (
                                this._style ||
                                (this._style = new c(this.getAttribute('style') || ''))
                            );
                        },
                        set style(e) {
                            this.style.cssText = e;
                        },
                        contains: function (e) {
                            for (; e; e = e.parentNode) if (e === this) return !0;
                            return !1;
                        },
                        hasChildNodes: function () {
                            return this.childNodes && this.childNodes.length > 0;
                        },
                        getElementById: function (e) {
                            return u.find(this, '#' + e, 1);
                        },
                        appendChild: function (e) {
                            return this.insertBefore(e);
                        },
                        insertBefore: function (e, t) {
                            var n = this,
                                r = n.childNodes;
                            if (11 === e.nodeType)
                                for (; e.firstChild; ) n.insertBefore(e.firstChild, t);
                            else
                                e.parentNode && e.parentNode.removeChild(e),
                                    (e.parentNode = n),
                                    r.splice(t ? r.indexOf(t) : r.length, 0, e),
                                    9 === n.nodeType &&
                                        1 === e.nodeType &&
                                        ((n.documentElement = e),
                                        (n.body = e.querySelector('body')));
                            return e;
                        },
                        removeChild: function (e) {
                            var t = this.childNodes.indexOf(e);
                            if (-1 === t) throw Error('NOT_FOUND_ERR');
                            return this.childNodes.splice(t, 1), (e.parentNode = null), e;
                        },
                        replaceChild: function (e, t) {
                            return this.insertBefore(e, t), this.removeChild(t);
                        },
                        cloneNode: function (e) {
                            var t = this,
                                n = new t.constructor(t.tagName || t.data);
                            return (
                                (n.ownerDocument = t.ownerDocument),
                                t.attributes &&
                                    t.attributes.names().forEach(function (e) {
                                        n.setAttribute(e, t.getAttribute(e));
                                    }),
                                e &&
                                    t.hasChildNodes() &&
                                    t.childNodes.forEach(function (t) {
                                        n.appendChild(t.cloneNode(e));
                                    }),
                                n
                            );
                        },
                        querySelector: function (e) {
                            return u.find(this, e, 1);
                        },
                        querySelectorAll: function (e) {
                            return u.find(this, e);
                        },
                        toString: function (e) {
                            return s[this.tagName]
                                ? this.textContent
                                : this.childNodes.reduce(function (t, n) {
                                      return t + n.toString(e);
                                  }, '');
                        },
                    },
                    h = {
                        get firstElementChild() {
                            return M(this.childNodes, 0, 1, 1);
                        },
                        get lastElementChild() {
                            return M(this.childNodes, this.childNodes.length - 1, -1, 1);
                        },
                        get nextElementSibling() {
                            return j(this, 1, 1);
                        },
                        get previousElementSibling() {
                            return j(this, -1, 1);
                        },
                        replaceChildren: I,
                        hasAttribute: function (e) {
                            return null != this.attributes.getNamedItem(e);
                        },
                        getAttribute: function (e) {
                            var t = this.attributes.getNamedItem(e);
                            return t ? t.value : null;
                        },
                        setAttribute: function (e, t) {
                            this.attributes.setNamedItem(new b(this, e, t));
                        },
                        removeAttribute: function (e) {
                            this.attributes.removeNamedItem(e);
                        },
                        getElementsByTagName: function (e) {
                            return u.find(this, e);
                        },
                        getElementsByClassName: function (e) {
                            return u.find(this, '.' + e.replace(/\s+/g, '.'));
                        },
                    },
                    p = /[\s"'`=<>]/,
                    f = /<|&(?=[a-z#])/gi,
                    m = /&[a-z]{1,31};?|&#(x|)([\da-f]+);/gi,
                    g = {
                        '&amp;': '&',
                        '&apos;': "'",
                        '&cent;': '¢',
                        '&copy;': '©',
                        '&curren;': '¤',
                        '&deg;': '°',
                        '&euro;': '€',
                        '&gt;': '>',
                        '&lt;': '<',
                        '&nbsp;': ' ',
                        '&plusmn;': '±',
                        '&pound;': '£',
                        '&quot;': '"',
                        '&reg;': '®',
                        '&sect;': '§',
                        '&sup2;': '²',
                        '&sup3;': '³',
                        '&yen;': '¥',
                    };
                function N(e) {
                    var t = e.toLowerCase();
                    Object.defineProperty(h, this[e] || e, {
                        configurable: !0,
                        enumerable: !0,
                        get: this.isBool
                            ? function () {
                                  return this.hasAttribute(t);
                              }
                            : this.isNum
                              ? function () {
                                    return +this.getAttribute(t) || 0;
                                }
                              : function () {
                                    return this.getAttribute(t) || '';
                                },
                        set: function (e) {
                            this.setAttribute(t, e);
                        },
                    });
                }
                function y(e) {
                    return '<' === e ? '&lt;' : '&amp;';
                }
                function v(e, t, n) {
                    return n ? String.fromCharCode(parseInt(n, '' === t ? 10 : 16)) : g[e] || e;
                }
                function b(e, t, n) {
                    (this.ownerElement = e), (this.name = t.toLowerCase()), (this.value = '' + n);
                }
                function E(e) {
                    Object.defineProperty(this, 'length', {
                        get: function () {
                            return this.names().length;
                        },
                    }),
                        Object.defineProperty(this, 'ownerElement', {value: e});
                }
                function C() {
                    this.childNodes = [];
                }
                function T(e) {
                    var t = this;
                    (t.attributes = new E(t)),
                        (t.childNodes = []),
                        (t.localName = e.toLowerCase()),
                        (t.nodeName = t.tagName = e.toUpperCase());
                }
                function _(e, t) {
                    var n = this;
                    (n.attributes = new E(n)),
                        (n.childNodes = []),
                        (n.namespaceURI = e),
                        (n.nodeName = n.tagName = n.localName = t);
                }
                function x(e) {
                    this.data = e;
                }
                function S(e) {
                    this.data = e;
                }
                function w(e) {
                    this.data = e;
                }
                function O() {
                    (this.childNodes = []),
                        this.appendChild(this.createElement('html')).appendChild(
                            (this.body = this.createElement('body')),
                        );
                }
                function A(e) {
                    return function (t, n) {
                        var r = new e(t, n);
                        return (r.ownerDocument = this), r;
                    };
                }
                function D(e, t) {
                    e.prototype = Object.create(d);
                    for (var n, r, i = 1; (t = arguments[i++]); )
                        for (r in t)
                            (n = Object.getOwnPropertyDescriptor(t, r)),
                                Object.defineProperty(e.prototype, r, n);
                    e.prototype.constructor = e;
                }
                function I() {
                    for (var e = this.childNodes, t = 0, n = e.length; t < n; )
                        e[t++].parentNode = null;
                    for (t = e.length = 0, n = arguments.length; t < n; )
                        this.insertBefore(arguments[t++]);
                }
                function M(e, t, n, r) {
                    if (e && t > -1) for (; e[t]; t += n) if (e[t].nodeType === r) return e[t];
                    return null;
                }
                function j(e, t, n) {
                    var r = e.parentNode && e.parentNode.childNodes,
                        i = r ? r.indexOf(e) : -1;
                    return n > 0 ? M(r, i + t, t, n) : (r && r[i + t]) || null;
                }
                Object.keys(r).forEach(N, {isBool: !0, readonly: 'readOnly'}),
                    'height maxLength minLength size tabIndex width'
                        .split(' ')
                        .forEach(N, {isNum: !0}),
                    'accept accesskey autocapitalize autofocus capture class contenteditable crossorigin dir for hidden href id integrity lang name nonce slot spellcheck src title type translate'
                        .split(' ')
                        .forEach(N, {for: 'htmlFor', class: 'className'}),
                    ['hasAttribute', 'getAttribute', 'setAttribute', 'removeAttribute'].forEach(
                        function (e) {
                            h[e + 'NS'] = function (t, n, r) {
                                return this[e].call(this, n, r);
                            };
                        },
                    ),
                    (E.prototype = {
                        names: function () {
                            return this.getNamedItem('style'), Object.keys(this);
                        },
                        getNamedItem: function (e) {
                            var t = e.toLowerCase(),
                                n = this[t] || null;
                            return (
                                'style' === t &&
                                    this.ownerElement._style &&
                                    (null === n && (n = this[t] = new b(this.ownerElement, e, '')),
                                    (n.value = this.ownerElement._style.cssText)),
                                n
                            );
                        },
                        removeNamedItem: function (e) {
                            var t = e.toLowerCase(),
                                n = this[t] || null;
                            return (
                                'style' === t && delete this.ownerElement._style,
                                null !== n && delete this[t],
                                n
                            );
                        },
                        setNamedItem: function (e) {
                            var t = this.getNamedItem(e.name);
                            return (
                                'style' === e.name && (e.value = new c(e.value).cssText),
                                (this[e.name] = e),
                                t
                            );
                        },
                        toString: function (e) {
                            var t = this,
                                n = t.ownerElement.tagName,
                                o = 'application/xml' === t.ownerElement.ownerDocument.contentType;
                            return t
                                .names()
                                .map(function (s) {
                                    var a = t.getNamedItem(s),
                                        c = a.name,
                                        u = a.value.replace(f, y);
                                    if (!o) {
                                        if (l.call(r, s)) return c;
                                        if (e) {
                                            if (
                                                ((u =
                                                    'on' === s.slice(0, 2)
                                                        ? u.replace(
                                                              /^[\s\uFEFF\xA0;]+|[\s\uFEFF\xA0;]+$/g,
                                                              '',
                                                          )
                                                        : u.replace(/\s+/g, ' ').trim()),
                                                l.call(i, (n + ' ' + c + ' ' + u).toLowerCase()))
                                            )
                                                return;
                                            if (!p.test(u)) return c + '=' + u;
                                            if (u.split('"').length > u.split("'").length)
                                                return c + "='" + u.replace(/'/g, '&#39;') + "'";
                                        }
                                    }
                                    return c + '="' + u.replace(/"/g, '&quot;') + '"';
                                })
                                .filter(Boolean)
                                .join(' ');
                        },
                    }),
                    D(C, d, {nodeType: 11, nodeName: '#document-fragment'}),
                    D(T, h, {
                        nodeType: 1,
                        matches: function (e) {
                            return u.matches(this, e);
                        },
                        closest: function (e) {
                            return u.closest(this, e);
                        },
                        namespaceURI: 'http://www.w3.org/1999/xhtml',
                        localName: null,
                        tagName: null,
                        toString: function (e) {
                            var t = this.attributes.toString(e);
                            return (
                                '<' +
                                this.localName +
                                (t ? ' ' + t + ('/' === t.slice(-1) ? ' >' : '>') : '>') +
                                (o[this.tagName]
                                    ? ''
                                    : d.toString.call(this, e) + '</' + this.localName + '>')
                            );
                        },
                    }),
                    (_.prototype = T.prototype),
                    D(x, {
                        nodeType: 3,
                        nodeName: '#text',
                        toString: function (e) {
                            return (e ? ('' + this.data).trim() : '' + this.data).replace(f, y);
                        },
                    }),
                    D(S, {
                        nodeType: 8,
                        nodeName: '#comment',
                        toString: function (e) {
                            return e ? '' : '\x3c!--' + this.data + '--\x3e';
                        },
                    }),
                    D(w, {
                        nodeType: 10,
                        toString: function () {
                            return '<' + this.data + '>';
                        },
                    }),
                    D(O, h, {
                        get title() {
                            var e = u.find(this, 'title', 1);
                            return (e && e.textContent) || '';
                        },
                        set title(e) {
                            (
                                u.find(this, 'title', 1) ||
                                this.appendChild(this.createElement('title'))
                            ).textContent = e;
                        },
                        nodeType: 9,
                        nodeName: '#document',
                        contentType: 'text/html',
                        createElement: A(T),
                        createElementNS: A(_),
                        createTextNode: A(x),
                        createComment: A(S),
                        createDocumentType: A(w),
                        createDocumentFragment: A(C),
                    }),
                    (t.Al = new O());
            },
            410: function () {
                !(function (e) {
                    var t = {'': function () {}},
                        n =
                            /([.#:[])([-\w]+)(?:\(((?:[^()]|\([^)]+\))+?)\)|([~^$*|]?)=(("|')(?:\\.|[^\\])*?\6|[-\w]+))?]?/g,
                        r =
                            /([\s>+~]*)(?:("|')(?:\\.|[^\\])*?\2|\((?:[^()]|\([^()]+\))+?\)|~=|[^'"()\s>+~])+$/,
                        i =
                            /\s*,\s*(?=(?:[^'"()]|"(?:\\.|[^\\"])*?"|'(?:\\.|[^\\'])*?'|\((?:[^()]|\([^()]+\))+?\))+$)/,
                        o = {
                            contains: '_.textContent.indexOf(v)>-1',
                            empty: '!_.lastChild',
                            enabled: "!m(_,':disabled')",
                            'first-child': '(a=_.parentNode)&&a.firstChild==_',
                            'first-of-type': '!p(_,_.tagName)',
                            is: 'm(_,v)',
                            lang: "m(c(_,'[lang]'),'[lang|='+v+']')",
                            'last-child': '(a=_.parentNode)&&a.lastChild==_',
                            'last-of-type': '!n(_,_.tagName)',
                            link: "m(_,'a[href]')",
                            not: '!m(_,v)',
                            'nth-child':
                                "(a=2,'odd'==v?b=1:'even'==v?b=0:a=1 in(v=v.split('n'))?(b=v[1],v[0]):(b=v[0],0),v=_.parentNode.childNodes,v=1+v.indexOf(_),0==a?v==b:('-'==a||0==(v-b)%a)&&(0<a||v<=b))",
                            'only-child': '(a=_.parentNode)&&a.firstChild==a.lastChild',
                            'only-of-type': '!p(_,_.tagName)&&!n(_,_.tagName)',
                            optional: "!m(_,':required')",
                            root: '(a=_.parentNode)&&!a.tagName',
                            '.': '~_.className.split(/\\s+/).indexOf(a)',
                            '#': '_.id==a',
                            '^': '!a.indexOf(v)',
                            '|': "a.split('-')[0]==v",
                            $: 'a.slice(-v.length)==v',
                            '~': '~a.split(/\\s+/).indexOf(v)',
                            '*': '~a.indexOf(v)',
                            '>>': 'm(_.parentNode,v)',
                            '++': 'm(_.previousSibling,v)',
                            '~~': 'p(_,v)',
                            '': 'c(_.parentNode,v)',
                        },
                        s = (e.closest = l.bind(e, 'parentNode', 1));
                    function a(e) {
                        if (null != e && 'string' != typeof e) throw Error('Invalid selector');
                        return (
                            t[e || ''] ||
                            (t[e] = Function(
                                'm,c,n,p',
                                'return function(_,v,a,b){return ' +
                                    e
                                        .split(i)
                                        .map(function (e) {
                                            var t,
                                                i,
                                                s = ['_&&_.nodeType==1'],
                                                a = e.replace(r, function (e, n, r, o) {
                                                    return (i = o + n.length), (t = n.trim()), '';
                                                }),
                                                l = e
                                                    .slice(i)
                                                    .replace(n, function (e, t, n, r, i, a, l) {
                                                        return (
                                                            s.push(
                                                                "((v='" +
                                                                    (
                                                                        r ||
                                                                        (l ? a.slice(1, -1) : a) ||
                                                                        ''
                                                                    ).replace(/[\\']/g, '\\$&') +
                                                                    "'),(a='" +
                                                                    n +
                                                                    "'),1)",
                                                                o[':' == t ? n : t] ||
                                                                    '(a=_.getAttribute(a))' +
                                                                        (i
                                                                            ? '&&' + o[i]
                                                                            : a
                                                                              ? '==v'
                                                                              : '!==null'),
                                                            ),
                                                            ''
                                                        );
                                                    });
                                            return (
                                                l &&
                                                    '*' != l &&
                                                    (s[0] +=
                                                        "&&_.tagName==(_.namespaceURI?'" +
                                                        l.toUpperCase() +
                                                        "':'" +
                                                        l +
                                                        "')"),
                                                a && s.push("(v='" + a + "')", o[t + t]),
                                                s.join('&&')
                                            );
                                        })
                                        .join('||') +
                                    '}',
                            )(c, s, u, d))
                        );
                    }
                    function l(e, t, n, r, i) {
                        r = a(r);
                        for (var o = []; n; n = n[e] || (i && i(n)))
                            if (r(n)) {
                                if (t) return n;
                                o.push(n);
                            }
                        return t ? null : o;
                    }
                    function c(e, t) {
                        return !!a(t)(e);
                    }
                    function u(e, t) {
                        return l('nextSibling', 1, e.nextSibling, t);
                    }
                    function d(e, t) {
                        return l('previousSibling', 1, e.previousSibling, t);
                    }
                    (o['nth-last-child'] = o['nth-child'].replace('1+', 'v.length-')),
                        (e.find = function (e, t, n) {
                            return l('firstChild', n, e.firstChild, t, function (t) {
                                for (var n = t.nextSibling; !n && (t = t.parentNode) !== e; )
                                    n = t.nextSibling;
                                return n;
                            });
                        }),
                        (e.matches = c),
                        (e.next = u),
                        (e.prev = d),
                        (e.selectorMap = o);
                })(this);
            },
        },
        t = {};
    function n(r) {
        var i = t[r];
        if (void 0 !== i) return i.exports;
        var o = (t[r] = {exports: {}});
        return e[r].call(o.exports, o, o.exports, n), o.exports;
    }
    (n.d = (e, t) => {
        for (var r in t)
            n.o(t, r) && !n.o(e, r) && Object.defineProperty(e, r, {enumerable: !0, get: t[r]});
    }),
        (n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
        (n.r = (e) => {
            'undefined' != typeof Symbol &&
                Symbol.toStringTag &&
                Object.defineProperty(e, Symbol.toStringTag, {value: 'Module'}),
                Object.defineProperty(e, '__esModule', {value: !0});
        });
    var r = {};
    for (var i in ((() => {
        'use strict';
        n.r(r), n.d(r, {document: () => e});
        const e = n(439).Al;
    })(),
    r))
        this[i] = r[i];
    r.__esModule && Object.defineProperty(this, '__esModule', {value: !0});
})();
