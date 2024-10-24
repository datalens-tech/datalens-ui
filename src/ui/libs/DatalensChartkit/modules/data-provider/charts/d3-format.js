/* eslint-disable */
(() => {
    'use strict';
    var t = {
            d: (r, i) => {
                for (var e in i)
                    t.o(i, e) &&
                        !t.o(r, e) &&
                        Object.defineProperty(r, e, {enumerable: !0, get: i[e]});
            },
            o: (t, r) => Object.prototype.hasOwnProperty.call(t, r),
            r: (t) => {
                'undefined' != typeof Symbol &&
                    Symbol.toStringTag &&
                    Object.defineProperty(t, Symbol.toStringTag, {value: 'Module'}),
                    Object.defineProperty(t, '__esModule', {value: !0});
            },
        },
        r = {};
    t.r(r), t.d(r, {d3: () => w});
    var i = {};
    function e(t, r) {
        if ((i = (t = r ? t.toExponential(r - 1) : t.toExponential()).indexOf('e')) < 0)
            return null;
        var i,
            e = t.slice(0, i);
        return [e.length > 1 ? e[0] + e.slice(2) : e, +t.slice(i + 1)];
    }
    function n(t) {
        return (t = e(Math.abs(t))) ? t[1] : NaN;
    }
    t.r(i),
        t.d(i, {
            FormatSpecifier: () => c,
            format: () => d,
            formatDefaultLocale: () => y,
            formatLocale: () => v,
            formatPrefix: () => m,
            formatSpecifier: () => s,
            precisionFixed: () => M,
            precisionPrefix: () => b,
            precisionRound: () => x,
        });
    var o,
        a = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
    function s(t) {
        if (!(r = a.exec(t))) throw new Error('invalid format: ' + t);
        var r;
        return new c({
            fill: r[1],
            align: r[2],
            sign: r[3],
            symbol: r[4],
            zero: r[5],
            width: r[6],
            comma: r[7],
            precision: r[8] && r[8].slice(1),
            trim: r[9],
            type: r[10],
        });
    }
    function c(t) {
        (this.fill = void 0 === t.fill ? ' ' : t.fill + ''),
            (this.align = void 0 === t.align ? '>' : t.align + ''),
            (this.sign = void 0 === t.sign ? '-' : t.sign + ''),
            (this.symbol = void 0 === t.symbol ? '' : t.symbol + ''),
            (this.zero = !!t.zero),
            (this.width = void 0 === t.width ? void 0 : +t.width),
            (this.comma = !!t.comma),
            (this.precision = void 0 === t.precision ? void 0 : +t.precision),
            (this.trim = !!t.trim),
            (this.type = void 0 === t.type ? '' : t.type + '');
    }
    function l(t, r) {
        var i = e(t, r);
        if (!i) return t + '';
        var n = i[0],
            o = i[1];
        return o < 0
            ? '0.' + new Array(-o).join('0') + n
            : n.length > o + 1
              ? n.slice(0, o + 1) + '.' + n.slice(o + 1)
              : n + new Array(o - n.length + 2).join('0');
    }
    (s.prototype = c.prototype),
        (c.prototype.toString = function () {
            return (
                this.fill +
                this.align +
                this.sign +
                this.symbol +
                (this.zero ? '0' : '') +
                (void 0 === this.width ? '' : Math.max(1, 0 | this.width)) +
                (this.comma ? ',' : '') +
                (void 0 === this.precision ? '' : '.' + Math.max(0, 0 | this.precision)) +
                (this.trim ? '~' : '') +
                this.type
            );
        });
    const h = {
        '%': (t, r) => (100 * t).toFixed(r),
        b: (t) => Math.round(t).toString(2),
        c: (t) => t + '',
        d: function (t) {
            return Math.abs((t = Math.round(t))) >= 1e21
                ? t.toLocaleString('en').replace(/,/g, '')
                : t.toString(10);
        },
        e: (t, r) => t.toExponential(r),
        f: (t, r) => t.toFixed(r),
        g: (t, r) => t.toPrecision(r),
        o: (t) => Math.round(t).toString(8),
        p: (t, r) => l(100 * t, r),
        r: l,
        s: function (t, r) {
            var i = e(t, r);
            if (!i) return t + '';
            var n = i[0],
                a = i[1],
                s = a - (o = 3 * Math.max(-8, Math.min(8, Math.floor(a / 3)))) + 1,
                c = n.length;
            return s === c
                ? n
                : s > c
                  ? n + new Array(s - c + 1).join('0')
                  : s > 0
                    ? n.slice(0, s) + '.' + n.slice(s)
                    : '0.' + new Array(1 - s).join('0') + e(t, Math.max(0, r + s - 1))[0];
        },
        X: (t) => Math.round(t).toString(16).toUpperCase(),
        x: (t) => Math.round(t).toString(16),
    };
    function u(t) {
        return t;
    }
    var f,
        d,
        m,
        g = Array.prototype.map,
        p = ['y', 'z', 'a', 'f', 'p', 'n', 'µ', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
    function v(t) {
        var r,
            i,
            e =
                void 0 === t.grouping || void 0 === t.thousands
                    ? u
                    : ((r = g.call(t.grouping, Number)),
                      (i = t.thousands + ''),
                      function (t, e) {
                          for (
                              var n = t.length, o = [], a = 0, s = r[0], c = 0;
                              n > 0 &&
                              s > 0 &&
                              (c + s + 1 > e && (s = Math.max(1, e - c)),
                              o.push(t.substring((n -= s), n + s)),
                              !((c += s + 1) > e));

                          )
                              s = r[(a = (a + 1) % r.length)];
                          return o.reverse().join(i);
                      }),
            a = void 0 === t.currency ? '' : t.currency[0] + '',
            c = void 0 === t.currency ? '' : t.currency[1] + '',
            l = void 0 === t.decimal ? '.' : t.decimal + '',
            f =
                void 0 === t.numerals
                    ? u
                    : (function (t) {
                          return function (r) {
                              return r.replace(/[0-9]/g, function (r) {
                                  return t[+r];
                              });
                          };
                      })(g.call(t.numerals, String)),
            d = void 0 === t.percent ? '%' : t.percent + '',
            m = void 0 === t.minus ? '−' : t.minus + '',
            v = void 0 === t.nan ? 'NaN' : t.nan + '';
        function y(t) {
            var r = (t = s(t)).fill,
                i = t.align,
                n = t.sign,
                u = t.symbol,
                g = t.zero,
                y = t.width,
                M = t.comma,
                b = t.precision,
                x = t.trim,
                w = t.type;
            'n' === w
                ? ((M = !0), (w = 'g'))
                : h[w] || (void 0 === b && (b = 12), (x = !0), (w = 'g')),
                (g || ('0' === r && '=' === i)) && ((g = !0), (r = '0'), (i = '='));
            var S = '$' === u ? a : '#' === u && /[boxX]/.test(w) ? '0' + w.toLowerCase() : '',
                j = '$' === u ? c : /[%p]/.test(w) ? d : '',
                P = h[w],
                k = /[defgprs%]/.test(w);
            function z(t) {
                var a,
                    s,
                    c,
                    h = S,
                    u = j;
                if ('c' === w) (u = P(t) + u), (t = '');
                else {
                    var d = (t = +t) < 0 || 1 / t < 0;
                    if (
                        ((t = isNaN(t) ? v : P(Math.abs(t), b)),
                        x &&
                            (t = (function (t) {
                                t: for (var r, i = t.length, e = 1, n = -1; e < i; ++e)
                                    switch (t[e]) {
                                        case '.':
                                            n = r = e;
                                            break;
                                        case '0':
                                            0 === n && (n = e), (r = e);
                                            break;
                                        default:
                                            if (!+t[e]) break t;
                                            n > 0 && (n = 0);
                                    }
                                return n > 0 ? t.slice(0, n) + t.slice(r + 1) : t;
                            })(t)),
                        d && 0 == +t && '+' !== n && (d = !1),
                        (h = (d ? ('(' === n ? n : m) : '-' === n || '(' === n ? '' : n) + h),
                        (u = ('s' === w ? p[8 + o / 3] : '') + u + (d && '(' === n ? ')' : '')),
                        k)
                    )
                        for (a = -1, s = t.length; ++a < s; )
                            if (48 > (c = t.charCodeAt(a)) || c > 57) {
                                (u = (46 === c ? l + t.slice(a + 1) : t.slice(a)) + u),
                                    (t = t.slice(0, a));
                                break;
                            }
                }
                M && !g && (t = e(t, 1 / 0));
                var z = h.length + t.length + u.length,
                    A = z < y ? new Array(y - z + 1).join(r) : '';
                switch (
                    (M && g && ((t = e(A + t, A.length ? y - u.length : 1 / 0)), (A = '')), i)
                ) {
                    case '<':
                        t = h + t + u + A;
                        break;
                    case '=':
                        t = h + A + t + u;
                        break;
                    case '^':
                        t = A.slice(0, (z = A.length >> 1)) + h + t + u + A.slice(z);
                        break;
                    default:
                        t = A + h + t + u;
                }
                return f(t);
            }
            return (
                (b =
                    void 0 === b
                        ? 6
                        : /[gprs]/.test(w)
                          ? Math.max(1, Math.min(21, b))
                          : Math.max(0, Math.min(20, b))),
                (z.toString = function () {
                    return t + '';
                }),
                z
            );
        }
        return {
            format: y,
            formatPrefix: function (t, r) {
                var i = y((((t = s(t)).type = 'f'), t)),
                    e = 3 * Math.max(-8, Math.min(8, Math.floor(n(r) / 3))),
                    o = Math.pow(10, -e),
                    a = p[8 + e / 3];
                return function (t) {
                    return i(o * t) + a;
                };
            },
        };
    }
    function y(t) {
        return (f = v(t)), (d = f.format), (m = f.formatPrefix), f;
    }
    function M(t) {
        return Math.max(0, -n(Math.abs(t)));
    }
    function b(t, r) {
        return Math.max(0, 3 * Math.max(-8, Math.min(8, Math.floor(n(r) / 3))) - n(Math.abs(t)));
    }
    function x(t, r) {
        return (t = Math.abs(t)), (r = Math.abs(r) - t), Math.max(0, n(r) - n(t)) + 1;
    }
    y({thousands: ',', grouping: [3], currency: ['$', '']});
    const w = {...globalThis.d3, ...i};
    for (var S in r) this[S] = r[S];
    r.__esModule && Object.defineProperty(this, '__esModule', {value: !0});
})();
