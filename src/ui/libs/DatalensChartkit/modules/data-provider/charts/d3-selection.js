/* eslint-disable */
(() => {
    'use strict';
    var t = {
            d: (n, e) => {
                for (var r in e)
                    t.o(e, r) &&
                        !t.o(n, r) &&
                        Object.defineProperty(n, r, {enumerable: !0, get: e[r]});
            },
            o: (t, n) => Object.prototype.hasOwnProperty.call(t, n),
            r: (t) => {
                'undefined' != typeof Symbol &&
                    Symbol.toStringTag &&
                    Object.defineProperty(t, Symbol.toStringTag, {value: 'Module'}),
                    Object.defineProperty(t, '__esModule', {value: !0});
            },
        },
        n = {};
    t.r(n), t.d(n, {d3: () => Et});
    var e = {};
    t.r(e),
        t.d(e, {
            create: () => vt,
            creator: () => s,
            local: () => gt,
            matcher: () => _,
            namespace: () => o,
            namespaces: () => i,
            pointer: () => bt,
            pointers: () => St,
            select: () => yt,
            selectAll: () => xt,
            selection: () => dt,
            selector: () => a,
            selectorAll: () => p,
            style: () => V,
            window: () => B,
        });
    var r = 'http://www.w3.org/1999/xhtml';
    const i = {
        svg: 'http://www.w3.org/2000/svg',
        xhtml: r,
        xlink: 'http://www.w3.org/1999/xlink',
        xml: 'http://www.w3.org/XML/1998/namespace',
        xmlns: 'http://www.w3.org/2000/xmlns/',
    };
    function o(t) {
        var n = (t += ''),
            e = n.indexOf(':');
        return (
            e >= 0 && 'xmlns' !== (n = t.slice(0, e)) && (t = t.slice(e + 1)),
            i.hasOwnProperty(n) ? {space: i[n], local: t} : t
        );
    }
    function u(t) {
        return function () {
            var n = this.ownerDocument,
                e = this.namespaceURI;
            return e === r && n.documentElement.namespaceURI === r
                ? n.createElement(t)
                : n.createElementNS(e, t);
        };
    }
    function c(t) {
        return function () {
            return this.ownerDocument.createElementNS(t.space, t.local);
        };
    }
    function s(t) {
        var n = o(t);
        return (n.local ? c : u)(n);
    }
    function l() {}
    function a(t) {
        return null == t
            ? l
            : function () {
                  return this.querySelector(t);
              };
    }
    function f(t) {
        return null == t ? [] : Array.isArray(t) ? t : Array.from(t);
    }
    function h() {
        return [];
    }
    function p(t) {
        return null == t
            ? h
            : function () {
                  return this.querySelectorAll(t);
              };
    }
    function _(t) {
        return function () {
            return this.matches(t);
        };
    }
    function d(t) {
        return function (n) {
            return n.matches(t);
        };
    }
    var y = Array.prototype.find;
    function v() {
        return this.firstElementChild;
    }
    var m = Array.prototype.filter;
    function g() {
        return Array.from(this.children);
    }
    function w(t) {
        return new Array(t.length);
    }
    function A(t, n) {
        (this.ownerDocument = t.ownerDocument),
            (this.namespaceURI = t.namespaceURI),
            (this._next = null),
            (this._parent = t),
            (this.__data__ = n);
    }
    function b(t, n, e, r, i, o) {
        for (var u, c = 0, s = n.length, l = o.length; c < l; ++c)
            (u = n[c]) ? ((u.__data__ = o[c]), (r[c] = u)) : (e[c] = new A(t, o[c]));
        for (; c < s; ++c) (u = n[c]) && (i[c] = u);
    }
    function S(t, n, e, r, i, o, u) {
        var c,
            s,
            l,
            a = new Map(),
            f = n.length,
            h = o.length,
            p = new Array(f);
        for (c = 0; c < f; ++c)
            (s = n[c]) &&
                ((p[c] = l = u.call(s, s.__data__, c, n) + ''),
                a.has(l) ? (i[c] = s) : a.set(l, s));
        for (c = 0; c < h; ++c)
            (l = u.call(t, o[c], c, o) + ''),
                (s = a.get(l))
                    ? ((r[c] = s), (s.__data__ = o[c]), a.delete(l))
                    : (e[c] = new A(t, o[c]));
        for (c = 0; c < f; ++c) (s = n[c]) && a.get(p[c]) === s && (i[c] = s);
    }
    function x(t) {
        return t.__data__;
    }
    function E(t) {
        return 'object' == typeof t && 'length' in t ? t : Array.from(t);
    }
    function N(t, n) {
        return t < n ? -1 : t > n ? 1 : t >= n ? 0 : NaN;
    }
    function C(t) {
        return function () {
            this.removeAttribute(t);
        };
    }
    function P(t) {
        return function () {
            this.removeAttributeNS(t.space, t.local);
        };
    }
    function M(t, n) {
        return function () {
            this.setAttribute(t, n);
        };
    }
    function O(t, n) {
        return function () {
            this.setAttributeNS(t.space, t.local, n);
        };
    }
    function T(t, n) {
        return function () {
            var e = n.apply(this, arguments);
            null == e ? this.removeAttribute(t) : this.setAttribute(t, e);
        };
    }
    function L(t, n) {
        return function () {
            var e = n.apply(this, arguments);
            null == e
                ? this.removeAttributeNS(t.space, t.local)
                : this.setAttributeNS(t.space, t.local, e);
        };
    }
    function B(t) {
        return (
            (t.ownerDocument && t.ownerDocument.defaultView) || (t.document && t) || t.defaultView
        );
    }
    function j(t) {
        return function () {
            this.style.removeProperty(t);
        };
    }
    function q(t, n, e) {
        return function () {
            this.style.setProperty(t, n, e);
        };
    }
    function D(t, n, e) {
        return function () {
            var r = n.apply(this, arguments);
            null == r ? this.style.removeProperty(t) : this.style.setProperty(t, r, e);
        };
    }
    function V(t, n) {
        return t.style.getPropertyValue(n) || B(t).getComputedStyle(t, null).getPropertyValue(n);
    }
    function R(t) {
        return function () {
            delete this[t];
        };
    }
    function H(t, n) {
        return function () {
            this[t] = n;
        };
    }
    function I(t, n) {
        return function () {
            var e = n.apply(this, arguments);
            null == e ? delete this[t] : (this[t] = e);
        };
    }
    function U(t) {
        return t.trim().split(/^|\s+/);
    }
    function X(t) {
        return t.classList || new G(t);
    }
    function G(t) {
        (this._node = t), (this._names = U(t.getAttribute('class') || ''));
    }
    function Y(t, n) {
        for (var e = X(t), r = -1, i = n.length; ++r < i; ) e.add(n[r]);
    }
    function k(t, n) {
        for (var e = X(t), r = -1, i = n.length; ++r < i; ) e.remove(n[r]);
    }
    function z(t) {
        return function () {
            Y(this, t);
        };
    }
    function F(t) {
        return function () {
            k(this, t);
        };
    }
    function J(t, n) {
        return function () {
            (n.apply(this, arguments) ? Y : k)(this, t);
        };
    }
    function K() {
        this.textContent = '';
    }
    function Q(t) {
        return function () {
            this.textContent = t;
        };
    }
    function W(t) {
        return function () {
            var n = t.apply(this, arguments);
            this.textContent = null == n ? '' : n;
        };
    }
    function Z() {
        this.innerHTML = '';
    }
    function $(t) {
        return function () {
            this.innerHTML = t;
        };
    }
    function tt(t) {
        return function () {
            var n = t.apply(this, arguments);
            this.innerHTML = null == n ? '' : n;
        };
    }
    function nt() {
        this.nextSibling && this.parentNode.appendChild(this);
    }
    function et() {
        this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
    }
    function rt() {
        return null;
    }
    function it() {
        var t = this.parentNode;
        t && t.removeChild(this);
    }
    function ot() {
        var t = this.cloneNode(!1),
            n = this.parentNode;
        return n ? n.insertBefore(t, this.nextSibling) : t;
    }
    function ut() {
        var t = this.cloneNode(!0),
            n = this.parentNode;
        return n ? n.insertBefore(t, this.nextSibling) : t;
    }
    function ct(t) {
        return function () {
            var n = this.__on;
            if (n) {
                for (var e, r = 0, i = -1, o = n.length; r < o; ++r)
                    (e = n[r]),
                        (t.type && e.type !== t.type) || e.name !== t.name
                            ? (n[++i] = e)
                            : this.removeEventListener(e.type, e.listener, e.options);
                ++i ? (n.length = i) : delete this.__on;
            }
        };
    }
    function st(t, n, e) {
        return function () {
            var r,
                i = this.__on,
                o = (function (t) {
                    return function (n) {
                        t.call(this, n, this.__data__);
                    };
                })(n);
            if (i)
                for (var u = 0, c = i.length; u < c; ++u)
                    if ((r = i[u]).type === t.type && r.name === t.name)
                        return (
                            this.removeEventListener(r.type, r.listener, r.options),
                            this.addEventListener(r.type, (r.listener = o), (r.options = e)),
                            void (r.value = n)
                        );
            this.addEventListener(t.type, o, e),
                (r = {type: t.type, name: t.name, value: n, listener: o, options: e}),
                i ? i.push(r) : (this.__on = [r]);
        };
    }
    function lt(t, n, e) {
        var r = B(t),
            i = r.CustomEvent;
        'function' == typeof i
            ? (i = new i(n, e))
            : ((i = r.document.createEvent('Event')),
              e
                  ? (i.initEvent(n, e.bubbles, e.cancelable), (i.detail = e.detail))
                  : i.initEvent(n, !1, !1)),
            t.dispatchEvent(i);
    }
    function at(t, n) {
        return function () {
            return lt(this, t, n);
        };
    }
    function ft(t, n) {
        return function () {
            return lt(this, t, n.apply(this, arguments));
        };
    }
    (A.prototype = {
        constructor: A,
        appendChild: function (t) {
            return this._parent.insertBefore(t, this._next);
        },
        insertBefore: function (t, n) {
            return this._parent.insertBefore(t, n);
        },
        querySelector: function (t) {
            return this._parent.querySelector(t);
        },
        querySelectorAll: function (t) {
            return this._parent.querySelectorAll(t);
        },
    }),
        (G.prototype = {
            add: function (t) {
                this._names.indexOf(t) < 0 &&
                    (this._names.push(t), this._node.setAttribute('class', this._names.join(' ')));
            },
            remove: function (t) {
                var n = this._names.indexOf(t);
                n >= 0 &&
                    (this._names.splice(n, 1),
                    this._node.setAttribute('class', this._names.join(' ')));
            },
            contains: function (t) {
                return this._names.indexOf(t) >= 0;
            },
        });
    var ht = [null];
    function pt(t, n) {
        (this._groups = t), (this._parents = n);
    }
    function _t() {
        return new pt([[document.documentElement]], ht);
    }
    pt.prototype = _t.prototype = {
        constructor: pt,
        select: function (t) {
            'function' != typeof t && (t = a(t));
            for (var n = this._groups, e = n.length, r = new Array(e), i = 0; i < e; ++i)
                for (var o, u, c = n[i], s = c.length, l = (r[i] = new Array(s)), f = 0; f < s; ++f)
                    (o = c[f]) &&
                        (u = t.call(o, o.__data__, f, c)) &&
                        ('__data__' in o && (u.__data__ = o.__data__), (l[f] = u));
            return new pt(r, this._parents);
        },
        selectAll: function (t) {
            t =
                'function' == typeof t
                    ? (function (t) {
                          return function () {
                              return f(t.apply(this, arguments));
                          };
                      })(t)
                    : p(t);
            for (var n = this._groups, e = n.length, r = [], i = [], o = 0; o < e; ++o)
                for (var u, c = n[o], s = c.length, l = 0; l < s; ++l)
                    (u = c[l]) && (r.push(t.call(u, u.__data__, l, c)), i.push(u));
            return new pt(r, i);
        },
        selectChild: function (t) {
            return this.select(
                null == t
                    ? v
                    : (function (t) {
                          return function () {
                              return y.call(this.children, t);
                          };
                      })('function' == typeof t ? t : d(t)),
            );
        },
        selectChildren: function (t) {
            return this.selectAll(
                null == t
                    ? g
                    : (function (t) {
                          return function () {
                              return m.call(this.children, t);
                          };
                      })('function' == typeof t ? t : d(t)),
            );
        },
        filter: function (t) {
            'function' != typeof t && (t = _(t));
            for (var n = this._groups, e = n.length, r = new Array(e), i = 0; i < e; ++i)
                for (var o, u = n[i], c = u.length, s = (r[i] = []), l = 0; l < c; ++l)
                    (o = u[l]) && t.call(o, o.__data__, l, u) && s.push(o);
            return new pt(r, this._parents);
        },
        data: function (t, n) {
            if (!arguments.length) return Array.from(this, x);
            var e,
                r = n ? S : b,
                i = this._parents,
                o = this._groups;
            'function' != typeof t &&
                ((e = t),
                (t = function () {
                    return e;
                }));
            for (
                var u = o.length, c = new Array(u), s = new Array(u), l = new Array(u), a = 0;
                a < u;
                ++a
            ) {
                var f = i[a],
                    h = o[a],
                    p = h.length,
                    _ = E(t.call(f, f && f.__data__, a, i)),
                    d = _.length,
                    y = (s[a] = new Array(d)),
                    v = (c[a] = new Array(d));
                r(f, h, y, v, (l[a] = new Array(p)), _, n);
                for (var m, g, w = 0, A = 0; w < d; ++w)
                    if ((m = y[w])) {
                        for (w >= A && (A = w + 1); !(g = v[A]) && ++A < d; );
                        m._next = g || null;
                    }
            }
            return ((c = new pt(c, i))._enter = s), (c._exit = l), c;
        },
        enter: function () {
            return new pt(this._enter || this._groups.map(w), this._parents);
        },
        exit: function () {
            return new pt(this._exit || this._groups.map(w), this._parents);
        },
        join: function (t, n, e) {
            var r = this.enter(),
                i = this,
                o = this.exit();
            return (
                'function' == typeof t ? (r = t(r)) && (r = r.selection()) : (r = r.append(t + '')),
                null != n && (i = n(i)) && (i = i.selection()),
                null == e ? o.remove() : e(o),
                r && i ? r.merge(i).order() : i
            );
        },
        merge: function (t) {
            for (
                var n = t.selection ? t.selection() : t,
                    e = this._groups,
                    r = n._groups,
                    i = e.length,
                    o = r.length,
                    u = Math.min(i, o),
                    c = new Array(i),
                    s = 0;
                s < u;
                ++s
            )
                for (
                    var l, a = e[s], f = r[s], h = a.length, p = (c[s] = new Array(h)), _ = 0;
                    _ < h;
                    ++_
                )
                    (l = a[_] || f[_]) && (p[_] = l);
            for (; s < i; ++s) c[s] = e[s];
            return new pt(c, this._parents);
        },
        selection: function () {
            return this;
        },
        order: function () {
            for (var t = this._groups, n = -1, e = t.length; ++n < e; )
                for (var r, i = t[n], o = i.length - 1, u = i[o]; --o >= 0; )
                    (r = i[o]) &&
                        (u && 4 ^ r.compareDocumentPosition(u) && u.parentNode.insertBefore(r, u),
                        (u = r));
            return this;
        },
        sort: function (t) {
            function n(n, e) {
                return n && e ? t(n.__data__, e.__data__) : !n - !e;
            }
            t || (t = N);
            for (var e = this._groups, r = e.length, i = new Array(r), o = 0; o < r; ++o) {
                for (var u, c = e[o], s = c.length, l = (i[o] = new Array(s)), a = 0; a < s; ++a)
                    (u = c[a]) && (l[a] = u);
                l.sort(n);
            }
            return new pt(i, this._parents).order();
        },
        call: function () {
            var t = arguments[0];
            return (arguments[0] = this), t.apply(null, arguments), this;
        },
        nodes: function () {
            return Array.from(this);
        },
        node: function () {
            for (var t = this._groups, n = 0, e = t.length; n < e; ++n)
                for (var r = t[n], i = 0, o = r.length; i < o; ++i) {
                    var u = r[i];
                    if (u) return u;
                }
            return null;
        },
        size: function () {
            let t = 0;
            for (const n of this) ++t;
            return t;
        },
        empty: function () {
            return !this.node();
        },
        each: function (t) {
            for (var n = this._groups, e = 0, r = n.length; e < r; ++e)
                for (var i, o = n[e], u = 0, c = o.length; u < c; ++u)
                    (i = o[u]) && t.call(i, i.__data__, u, o);
            return this;
        },
        attr: function (t, n) {
            var e = o(t);
            if (arguments.length < 2) {
                var r = this.node();
                return e.local ? r.getAttributeNS(e.space, e.local) : r.getAttribute(e);
            }
            return this.each(
                (null == n
                    ? e.local
                        ? P
                        : C
                    : 'function' == typeof n
                      ? e.local
                          ? L
                          : T
                      : e.local
                        ? O
                        : M)(e, n),
            );
        },
        style: function (t, n, e) {
            return arguments.length > 1
                ? this.each(
                      (null == n ? j : 'function' == typeof n ? D : q)(t, n, null == e ? '' : e),
                  )
                : V(this.node(), t);
        },
        property: function (t, n) {
            return arguments.length > 1
                ? this.each((null == n ? R : 'function' == typeof n ? I : H)(t, n))
                : this.node()[t];
        },
        classed: function (t, n) {
            var e = U(t + '');
            if (arguments.length < 2) {
                for (var r = X(this.node()), i = -1, o = e.length; ++i < o; )
                    if (!r.contains(e[i])) return !1;
                return !0;
            }
            return this.each(('function' == typeof n ? J : n ? z : F)(e, n));
        },
        text: function (t) {
            return arguments.length
                ? this.each(null == t ? K : ('function' == typeof t ? W : Q)(t))
                : this.node().textContent;
        },
        html: function (t) {
            return arguments.length
                ? this.each(null == t ? Z : ('function' == typeof t ? tt : $)(t))
                : this.node().innerHTML;
        },
        raise: function () {
            return this.each(nt);
        },
        lower: function () {
            return this.each(et);
        },
        append: function (t) {
            var n = 'function' == typeof t ? t : s(t);
            return this.select(function () {
                return this.appendChild(n.apply(this, arguments));
            });
        },
        insert: function (t, n) {
            var e = 'function' == typeof t ? t : s(t),
                r = null == n ? rt : 'function' == typeof n ? n : a(n);
            return this.select(function () {
                return this.insertBefore(
                    e.apply(this, arguments),
                    r.apply(this, arguments) || null,
                );
            });
        },
        remove: function () {
            return this.each(it);
        },
        clone: function (t) {
            return this.select(t ? ut : ot);
        },
        datum: function (t) {
            return arguments.length ? this.property('__data__', t) : this.node().__data__;
        },
        on: function (t, n, e) {
            var r,
                i,
                o = (function (t) {
                    return t
                        .trim()
                        .split(/^|\s+/)
                        .map(function (t) {
                            var n = '',
                                e = t.indexOf('.');
                            return (
                                e >= 0 && ((n = t.slice(e + 1)), (t = t.slice(0, e))),
                                {type: t, name: n}
                            );
                        });
                })(t + ''),
                u = o.length;
            if (!(arguments.length < 2)) {
                for (c = n ? st : ct, r = 0; r < u; ++r) this.each(c(o[r], n, e));
                return this;
            }
            var c = this.node().__on;
            if (c)
                for (var s, l = 0, a = c.length; l < a; ++l)
                    for (r = 0, s = c[l]; r < u; ++r)
                        if ((i = o[r]).type === s.type && i.name === s.name) return s.value;
        },
        dispatch: function (t, n) {
            return this.each(('function' == typeof n ? ft : at)(t, n));
        },
        [Symbol.iterator]: function* () {
            for (var t = this._groups, n = 0, e = t.length; n < e; ++n)
                for (var r, i = t[n], o = 0, u = i.length; o < u; ++o) (r = i[o]) && (yield r);
        },
    };
    const dt = _t;
    function yt(t) {
        return 'string' == typeof t
            ? new pt([[document.querySelector(t)]], [document.documentElement])
            : new pt([[t]], ht);
    }
    function vt(t) {
        return yt(s(t).call(document.documentElement));
    }
    var mt = 0;
    function gt() {
        return new wt();
    }
    function wt() {
        this._ = '@' + (++mt).toString(36);
    }
    function At(t) {
        let n;
        for (; (n = t.sourceEvent); ) t = n;
        return t;
    }
    function bt(t, n) {
        if (((t = At(t)), void 0 === n && (n = t.currentTarget), n)) {
            var e = n.ownerSVGElement || n;
            if (e.createSVGPoint) {
                var r = e.createSVGPoint();
                return (
                    (r.x = t.clientX),
                    (r.y = t.clientY),
                    [(r = r.matrixTransform(n.getScreenCTM().inverse())).x, r.y]
                );
            }
            if (n.getBoundingClientRect) {
                var i = n.getBoundingClientRect();
                return [t.clientX - i.left - n.clientLeft, t.clientY - i.top - n.clientTop];
            }
        }
        return [t.pageX, t.pageY];
    }
    function St(t, n) {
        return (
            t.target &&
                ((t = At(t)), void 0 === n && (n = t.currentTarget), (t = t.touches || [t])),
            Array.from(t, (t) => bt(t, n))
        );
    }
    function xt(t) {
        return 'string' == typeof t
            ? new pt([document.querySelectorAll(t)], [document.documentElement])
            : new pt([f(t)], ht);
    }
    wt.prototype = gt.prototype = {
        constructor: wt,
        get: function (t) {
            for (var n = this._; !(n in t); ) if (!(t = t.parentNode)) return;
            return t[n];
        },
        set: function (t, n) {
            return (t[this._] = n);
        },
        remove: function (t) {
            return this._ in t && delete t[this._];
        },
        toString: function () {
            return this._;
        },
    };
    const Et = {...globalThis.d3, ...e};
    for (var Nt in n) this[Nt] = n[Nt];
    n.__esModule && Object.defineProperty(this, '__esModule', {value: !0});
})();
