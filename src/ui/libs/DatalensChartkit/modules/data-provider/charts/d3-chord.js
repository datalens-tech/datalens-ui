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
    t.r(n), t.d(n, {d3: () => R});
    var e = {};
    t.r(e),
        t.d(e, {
            chord: () => f,
            chordDirected: () => _,
            chordTranspose: () => p,
            ribbon: () => L,
            ribbonArrow: () => E,
        });
    var r = Math.abs,
        i = Math.cos,
        o = Math.sin,
        u = Math.PI,
        s = u / 2,
        l = 2 * u,
        a = Math.max,
        h = 1e-12;
    function c(t, n) {
        return Array.from({length: n - t}, (n, e) => t + e);
    }
    function f() {
        return d(!1, !1);
    }
    function p() {
        return d(!1, !0);
    }
    function _() {
        return d(!0, !1);
    }
    function d(t, n) {
        var e = 0,
            r = null,
            i = null,
            o = null;
        function u(u) {
            var s,
                h = u.length,
                f = new Array(h),
                p = c(0, h),
                _ = new Array(h * h),
                d = new Array(h),
                g = 0;
            u = Float64Array.from(
                {length: h * h},
                n ? (t, n) => u[n % h][(n / h) | 0] : (t, n) => u[(n / h) | 0][n % h],
            );
            for (let n = 0; n < h; ++n) {
                let e = 0;
                for (let r = 0; r < h; ++r) e += u[n * h + r] + t * u[r * h + n];
                g += f[n] = e;
            }
            s = (g = a(0, l - e * h) / g) ? e : l / h;
            {
                let n = 0;
                r && p.sort((t, n) => r(f[t], f[n]));
                for (const e of p) {
                    const r = n;
                    if (t) {
                        const t = c(1 + ~h, h).filter((t) =>
                            t < 0 ? u[~t * h + e] : u[e * h + t],
                        );
                        i &&
                            t.sort((t, n) =>
                                i(
                                    t < 0 ? -u[~t * h + e] : u[e * h + t],
                                    n < 0 ? -u[~n * h + e] : u[e * h + n],
                                ),
                            );
                        for (const r of t)
                            r < 0
                                ? ((
                                      _[~r * h + e] ||
                                      (_[~r * h + e] = {source: null, target: null})
                                  ).target = {
                                      index: e,
                                      startAngle: n,
                                      endAngle: (n += u[~r * h + e] * g),
                                      value: u[~r * h + e],
                                  })
                                : ((
                                      _[e * h + r] || (_[e * h + r] = {source: null, target: null})
                                  ).source = {
                                      index: e,
                                      startAngle: n,
                                      endAngle: (n += u[e * h + r] * g),
                                      value: u[e * h + r],
                                  });
                        d[e] = {index: e, startAngle: r, endAngle: n, value: f[e]};
                    } else {
                        const t = c(0, h).filter((t) => u[e * h + t] || u[t * h + e]);
                        i && t.sort((t, n) => i(u[e * h + t], u[e * h + n]));
                        for (const r of t) {
                            let t;
                            if (
                                (e < r
                                    ? ((t =
                                          _[e * h + r] ||
                                          (_[e * h + r] = {source: null, target: null})),
                                      (t.source = {
                                          index: e,
                                          startAngle: n,
                                          endAngle: (n += u[e * h + r] * g),
                                          value: u[e * h + r],
                                      }))
                                    : ((t =
                                          _[r * h + e] ||
                                          (_[r * h + e] = {source: null, target: null})),
                                      (t.target = {
                                          index: e,
                                          startAngle: n,
                                          endAngle: (n += u[e * h + r] * g),
                                          value: u[e * h + r],
                                      }),
                                      e === r && (t.source = t.target)),
                                t.source && t.target && t.source.value < t.target.value)
                            ) {
                                const n = t.source;
                                (t.source = t.target), (t.target = n);
                            }
                        }
                        d[e] = {index: e, startAngle: r, endAngle: n, value: f[e]};
                    }
                    n += s;
                }
            }
            return ((_ = Object.values(_)).groups = d), o ? _.sort(o) : _;
        }
        return (
            (u.padAngle = function (t) {
                return arguments.length ? ((e = a(0, t)), u) : e;
            }),
            (u.sortGroups = function (t) {
                return arguments.length ? ((r = t), u) : r;
            }),
            (u.sortSubgroups = function (t) {
                return arguments.length ? ((i = t), u) : i;
            }),
            (u.sortChords = function (t) {
                return arguments.length
                    ? (null == t
                          ? (o = null)
                          : (((n = t),
                            (o = function (t, e) {
                                return n(
                                    t.source.value + t.target.value,
                                    e.source.value + e.target.value,
                                );
                            }))._ = t),
                      u)
                    : o && o._;
                var n;
            }),
            u
        );
    }
    const g = Math.PI,
        y = 2 * g,
        $ = 1e-6,
        v = y - $;
    function x(t) {
        this._ += t[0];
        for (let n = 1, e = t.length; n < e; ++n) this._ += arguments[n] + t[n];
    }
    class A {
        constructor(t) {
            (this._x0 = this._y0 = this._x1 = this._y1 = null),
                (this._ = ''),
                (this._append =
                    null == t
                        ? x
                        : (function (t) {
                              let n = Math.floor(t);
                              if (!(n >= 0)) throw new Error(`invalid digits: ${t}`);
                              if (n > 15) return x;
                              const e = 10 ** n;
                              return function (t) {
                                  this._ += t[0];
                                  for (let n = 1, r = t.length; n < r; ++n)
                                      this._ += Math.round(arguments[n] * e) / e + t[n];
                              };
                          })(t));
        }
        moveTo(t, n) {
            this._append`M${(this._x0 = this._x1 = +t)},${(this._y0 = this._y1 = +n)}`;
        }
        closePath() {
            null !== this._x1 && ((this._x1 = this._x0), (this._y1 = this._y0), this._append`Z`);
        }
        lineTo(t, n) {
            this._append`L${(this._x1 = +t)},${(this._y1 = +n)}`;
        }
        quadraticCurveTo(t, n, e, r) {
            this._append`Q${+t},${+n},${(this._x1 = +e)},${(this._y1 = +r)}`;
        }
        bezierCurveTo(t, n, e, r, i, o) {
            this._append`C${+t},${+n},${+e},${+r},${(this._x1 = +i)},${(this._y1 = +o)}`;
        }
        arcTo(t, n, e, r, i) {
            if (((t = +t), (n = +n), (e = +e), (r = +r), (i = +i) < 0))
                throw new Error(`negative radius: ${i}`);
            let o = this._x1,
                u = this._y1,
                s = e - t,
                l = r - n,
                a = o - t,
                h = u - n,
                c = a * a + h * h;
            if (null === this._x1) this._append`M${(this._x1 = t)},${(this._y1 = n)}`;
            else if (c > $)
                if (Math.abs(h * s - l * a) > $ && i) {
                    let f = e - o,
                        p = r - u,
                        _ = s * s + l * l,
                        d = f * f + p * p,
                        y = Math.sqrt(_),
                        v = Math.sqrt(c),
                        x = i * Math.tan((g - Math.acos((_ + c - d) / (2 * y * v))) / 2),
                        A = x / v,
                        M = x / y;
                    Math.abs(A - 1) > $ && this._append`L${t + A * a},${n + A * h}`,
                        this
                            ._append`A${i},${i},0,0,${+(h * f > a * p)},${(this._x1 = t + M * s)},${(this._y1 = n + M * l)}`;
                } else this._append`L${(this._x1 = t)},${(this._y1 = n)}`;
        }
        arc(t, n, e, r, i, o) {
            if (((t = +t), (n = +n), (o = !!o), (e = +e) < 0))
                throw new Error(`negative radius: ${e}`);
            let u = e * Math.cos(r),
                s = e * Math.sin(r),
                l = t + u,
                a = n + s,
                h = 1 ^ o,
                c = o ? r - i : i - r;
            null === this._x1
                ? this._append`M${l},${a}`
                : (Math.abs(this._x1 - l) > $ || Math.abs(this._y1 - a) > $) &&
                  this._append`L${l},${a}`,
                e &&
                    (c < 0 && (c = (c % y) + y),
                    c > v
                        ? this
                              ._append`A${e},${e},0,1,${h},${t - u},${n - s}A${e},${e},0,1,${h},${(this._x1 = l)},${(this._y1 = a)}`
                        : c > $ &&
                          this
                              ._append`A${e},${e},0,${+(c >= g)},${h},${(this._x1 = t + e * Math.cos(i))},${(this._y1 = n + e * Math.sin(i))}`);
        }
        rect(t, n, e, r) {
            this
                ._append`M${(this._x0 = this._x1 = +t)},${(this._y0 = this._y1 = +n)}h${(e = +e)}v${+r}h${-e}Z`;
        }
        toString() {
            return this._;
        }
    }
    function M() {
        return new A();
    }
    M.prototype = A.prototype;
    var b = Array.prototype.slice;
    function T(t) {
        return function () {
            return t;
        };
    }
    function w(t) {
        return t.source;
    }
    function m(t) {
        return t.target;
    }
    function P(t) {
        return t.radius;
    }
    function C(t) {
        return t.startAngle;
    }
    function O(t) {
        return t.endAngle;
    }
    function S() {
        return 0;
    }
    function j() {
        return 10;
    }
    function q(t) {
        var n = w,
            e = m,
            u = P,
            l = P,
            a = C,
            c = O,
            f = S,
            p = null;
        function _() {
            var _,
                d = n.apply(this, arguments),
                g = e.apply(this, arguments),
                y = f.apply(this, arguments) / 2,
                $ = b.call(arguments),
                v = +u.apply(this, (($[0] = d), $)),
                x = a.apply(this, $) - s,
                A = c.apply(this, $) - s,
                T = +l.apply(this, (($[0] = g), $)),
                w = a.apply(this, $) - s,
                m = c.apply(this, $) - s;
            if (
                (p || (p = _ = M()),
                y > h &&
                    (r(A - x) > 2 * y + h
                        ? A > x
                            ? ((x += y), (A -= y))
                            : ((x -= y), (A += y))
                        : (x = A = (x + A) / 2),
                    r(m - w) > 2 * y + h
                        ? m > w
                            ? ((w += y), (m -= y))
                            : ((w -= y), (m += y))
                        : (w = m = (w + m) / 2)),
                p.moveTo(v * i(x), v * o(x)),
                p.arc(0, 0, v, x, A),
                x !== w || A !== m)
            )
                if (t) {
                    var P = T - +t.apply(this, arguments),
                        C = (w + m) / 2;
                    p.quadraticCurveTo(0, 0, P * i(w), P * o(w)),
                        p.lineTo(T * i(C), T * o(C)),
                        p.lineTo(P * i(m), P * o(m));
                } else p.quadraticCurveTo(0, 0, T * i(w), T * o(w)), p.arc(0, 0, T, w, m);
            if ((p.quadraticCurveTo(0, 0, v * i(x), v * o(x)), p.closePath(), _))
                return (p = null), _ + '' || null;
        }
        return (
            t &&
                (_.headRadius = function (n) {
                    return arguments.length ? ((t = 'function' == typeof n ? n : T(+n)), _) : t;
                }),
            (_.radius = function (t) {
                return arguments.length ? ((u = l = 'function' == typeof t ? t : T(+t)), _) : u;
            }),
            (_.sourceRadius = function (t) {
                return arguments.length ? ((u = 'function' == typeof t ? t : T(+t)), _) : u;
            }),
            (_.targetRadius = function (t) {
                return arguments.length ? ((l = 'function' == typeof t ? t : T(+t)), _) : l;
            }),
            (_.startAngle = function (t) {
                return arguments.length ? ((a = 'function' == typeof t ? t : T(+t)), _) : a;
            }),
            (_.endAngle = function (t) {
                return arguments.length ? ((c = 'function' == typeof t ? t : T(+t)), _) : c;
            }),
            (_.padAngle = function (t) {
                return arguments.length ? ((f = 'function' == typeof t ? t : T(+t)), _) : f;
            }),
            (_.source = function (t) {
                return arguments.length ? ((n = t), _) : n;
            }),
            (_.target = function (t) {
                return arguments.length ? ((e = t), _) : e;
            }),
            (_.context = function (t) {
                return arguments.length ? ((p = null == t ? null : t), _) : p;
            }),
            _
        );
    }
    function L() {
        return q();
    }
    function E() {
        return q(j);
    }
    const R = {...globalThis.d3, ...e};
    for (var I in n) this[I] = n[I];
    n.__esModule && Object.defineProperty(this, '__esModule', {value: !0});
})();
