/* eslint-disable */
(() => {
    'use strict';
    var t = {
            d: (i, n) => {
                for (var e in n)
                    t.o(n, e) &&
                        !t.o(i, e) &&
                        Object.defineProperty(i, e, {enumerable: !0, get: n[e]});
            },
            o: (t, i) => Object.prototype.hasOwnProperty.call(t, i),
            r: (t) => {
                void 0 !== Ct &&
                    Ct.toStringTag &&
                    Object.defineProperty(t, Ct.toStringTag, {value: 'Module'}),
                    Object.defineProperty(t, '__esModule', {value: !0});
            },
        },
        i = {};
    t.r(i), t.d(i, {d3: () => Xi});
    var n = {};
    function e(t) {
        return function () {
            return t;
        };
    }
    t.r(n),
        t.d(n, {
            arc: () => E,
            area: () => X,
            areaRadial: () => Z,
            curveBasis: () => qt,
            curveBasisClosed: () => Yt,
            curveBasisOpen: () => Bt,
            curveBumpX: () => G,
            curveBumpY: () => J,
            curveBundle: () => It,
            curveCardinal: () => Wt,
            curveCardinalClosed: () => Ft,
            curveCardinalOpen: () => Qt,
            curveCatmullRom: () => Kt,
            curveCatmullRomClosed: () => ti,
            curveCatmullRomOpen: () => ni,
            curveLinear: () => O,
            curveLinearClosed: () => si,
            curveMonotoneX: () => ui,
            curveMonotoneY: () => fi,
            curveNatural: () => pi,
            curveStep: () => vi,
            curveStepAfter: () => gi,
            curveStepBefore: () => Ti,
            line: () => q,
            lineRadial: () => W,
            link: () => it,
            linkHorizontal: () => nt,
            linkRadial: () => st,
            linkVertical: () => et,
            pie: () => B,
            pointRadial: () => F,
            radialArea: () => Z,
            radialLine: () => W,
            stack: () => Mi,
            stackOffsetDiverging: () => $i,
            stackOffsetExpand: () => Si,
            stackOffsetNone: () => bi,
            stackOffsetSilhouette: () => Ni,
            stackOffsetWiggle: () => Ei,
            stackOrderAppearance: () => Pi,
            stackOrderAscending: () => Ci,
            stackOrderDescending: () => Ri,
            stackOrderInsideOut: () => zi,
            stackOrderNone: () => mi,
            stackOrderReverse: () => qi,
            symbol: () => Ct,
            symbolAsterisk: () => ht,
            symbolCircle: () => _t,
            symbolCross: () => rt,
            symbolDiamond: () => ct,
            symbolDiamond2: () => ut,
            symbolPlus: () => ft,
            symbolSquare: () => yt,
            symbolSquare2: () => xt,
            symbolStar: () => Tt,
            symbolTimes: () => Et,
            symbolTriangle: () => bt,
            symbolTriangle2: () => wt,
            symbolWye: () => Nt,
            symbolX: () => Et,
            symbols: () => Pt,
            symbolsFill: () => Pt,
            symbolsStroke: () => At,
        });
    const s = Math.abs,
        o = Math.atan2,
        h = Math.cos,
        _ = Math.max,
        r = Math.min,
        a = Math.sin,
        l = Math.sqrt,
        c = 1e-12,
        u = Math.PI,
        f = u / 2,
        y = 2 * u;
    function x(t) {
        return t >= 1 ? f : t <= -1 ? -f : Math.asin(t);
    }
    const p = Math.PI,
        d = 2 * p,
        v = 1e-6,
        T = d - v;
    function g(t) {
        this._ += t[0];
        for (let i = 1, n = t.length; i < n; ++i) this._ += arguments[i] + t[i];
    }
    class b {
        constructor(t) {
            (this._x0 = this._y0 = this._x1 = this._y1 = null),
                (this._ = ''),
                (this._append =
                    null == t
                        ? g
                        : (function (t) {
                              let i = Math.floor(t);
                              if (!(i >= 0)) throw new Error(`invalid digits: ${t}`);
                              if (i > 15) return g;
                              const n = 10 ** i;
                              return function (t) {
                                  this._ += t[0];
                                  for (let i = 1, e = t.length; i < e; ++i)
                                      this._ += Math.round(arguments[i] * n) / n + t[i];
                              };
                          })(t));
        }
        moveTo(t, i) {
            this._append`M${(this._x0 = this._x1 = +t)},${(this._y0 = this._y1 = +i)}`;
        }
        closePath() {
            null !== this._x1 && ((this._x1 = this._x0), (this._y1 = this._y0), this._append`Z`);
        }
        lineTo(t, i) {
            this._append`L${(this._x1 = +t)},${(this._y1 = +i)}`;
        }
        quadraticCurveTo(t, i, n, e) {
            this._append`Q${+t},${+i},${(this._x1 = +n)},${(this._y1 = +e)}`;
        }
        bezierCurveTo(t, i, n, e, s, o) {
            this._append`C${+t},${+i},${+n},${+e},${(this._x1 = +s)},${(this._y1 = +o)}`;
        }
        arcTo(t, i, n, e, s) {
            if (((t = +t), (i = +i), (n = +n), (e = +e), (s = +s) < 0))
                throw new Error(`negative radius: ${s}`);
            let o = this._x1,
                h = this._y1,
                _ = n - t,
                r = e - i,
                a = o - t,
                l = h - i,
                c = a * a + l * l;
            if (null === this._x1) this._append`M${(this._x1 = t)},${(this._y1 = i)}`;
            else if (c > v)
                if (Math.abs(l * _ - r * a) > v && s) {
                    let u = n - o,
                        f = e - h,
                        y = _ * _ + r * r,
                        x = u * u + f * f,
                        d = Math.sqrt(y),
                        T = Math.sqrt(c),
                        g = s * Math.tan((p - Math.acos((y + c - x) / (2 * d * T))) / 2),
                        b = g / T,
                        m = g / d;
                    Math.abs(b - 1) > v && this._append`L${t + b * a},${i + b * l}`,
                        this
                            ._append`A${s},${s},0,0,${+(l * u > a * f)},${(this._x1 = t + m * _)},${(this._y1 = i + m * r)}`;
                } else this._append`L${(this._x1 = t)},${(this._y1 = i)}`;
        }
        arc(t, i, n, e, s, o) {
            if (((t = +t), (i = +i), (o = !!o), (n = +n) < 0))
                throw new Error(`negative radius: ${n}`);
            let h = n * Math.cos(e),
                _ = n * Math.sin(e),
                r = t + h,
                a = i + _,
                l = 1 ^ o,
                c = o ? e - s : s - e;
            null === this._x1
                ? this._append`M${r},${a}`
                : (Math.abs(this._x1 - r) > v || Math.abs(this._y1 - a) > v) &&
                  this._append`L${r},${a}`,
                n &&
                    (c < 0 && (c = (c % d) + d),
                    c > T
                        ? this
                              ._append`A${n},${n},0,1,${l},${t - h},${i - _}A${n},${n},0,1,${l},${(this._x1 = r)},${(this._y1 = a)}`
                        : c > v &&
                          this
                              ._append`A${n},${n},0,${+(c >= p)},${l},${(this._x1 = t + n * Math.cos(s))},${(this._y1 = i + n * Math.sin(s))}`);
        }
        rect(t, i, n, e) {
            this
                ._append`M${(this._x0 = this._x1 = +t)},${(this._y0 = this._y1 = +i)}h${(n = +n)}v${+e}h${-n}Z`;
        }
        toString() {
            return this._;
        }
    }
    function m(t) {
        let i = 3;
        return (
            (t.digits = function (n) {
                if (!arguments.length) return i;
                if (null == n) i = null;
                else {
                    const t = Math.floor(n);
                    if (!(t >= 0)) throw new RangeError(`invalid digits: ${n}`);
                    i = t;
                }
                return t;
            }),
            () => new b(i)
        );
    }
    function w(t) {
        return t.innerRadius;
    }
    function k(t) {
        return t.outerRadius;
    }
    function M(t) {
        return t.startAngle;
    }
    function S(t) {
        return t.endAngle;
    }
    function $(t) {
        return t && t.padAngle;
    }
    function N(t, i, n, e, s, o, h) {
        var r = t - n,
            a = i - e,
            c = (h ? o : -o) / l(r * r + a * a),
            u = c * a,
            f = -c * r,
            y = t + u,
            x = i + f,
            p = n + u,
            d = e + f,
            v = (y + p) / 2,
            T = (x + d) / 2,
            g = p - y,
            b = d - x,
            m = g * g + b * b,
            w = s - o,
            k = y * d - p * x,
            M = (b < 0 ? -1 : 1) * l(_(0, w * w * m - k * k)),
            S = (k * b - g * M) / m,
            $ = (-k * g - b * M) / m,
            N = (k * b + g * M) / m,
            E = (-k * g + b * M) / m,
            P = S - v,
            A = $ - T,
            C = N - v,
            O = E - T;
        return (
            P * P + A * A > C * C + O * O && ((S = N), ($ = E)),
            {cx: S, cy: $, x01: -u, y01: -f, x11: S * (s / w - 1), y11: $ * (s / w - 1)}
        );
    }
    function E() {
        var t = w,
            i = k,
            n = e(0),
            _ = null,
            p = M,
            d = S,
            v = $,
            T = null,
            g = m(b);
        function b() {
            var e,
                b,
                m,
                w = +t.apply(this, arguments),
                k = +i.apply(this, arguments),
                M = p.apply(this, arguments) - f,
                S = d.apply(this, arguments) - f,
                $ = s(S - M),
                E = S > M;
            if ((T || (T = e = g()), k < w && ((b = k), (k = w), (w = b)), k > c))
                if ($ > y - c)
                    T.moveTo(k * h(M), k * a(M)),
                        T.arc(0, 0, k, M, S, !E),
                        w > c && (T.moveTo(w * h(S), w * a(S)), T.arc(0, 0, w, S, M, E));
                else {
                    var P,
                        A,
                        C = M,
                        O = S,
                        R = M,
                        z = S,
                        q = $,
                        X = $,
                        Y = v.apply(this, arguments) / 2,
                        j = Y > c && (_ ? +_.apply(this, arguments) : l(w * w + k * k)),
                        B = r(s(k - w) / 2, +n.apply(this, arguments)),
                        L = B,
                        I = B;
                    if (j > c) {
                        var D = x((j / w) * a(Y)),
                            V = x((j / k) * a(Y));
                        (q -= 2 * D) > c
                            ? ((R += D *= E ? 1 : -1), (z -= D))
                            : ((q = 0), (R = z = (M + S) / 2)),
                            (X -= 2 * V) > c
                                ? ((C += V *= E ? 1 : -1), (O -= V))
                                : ((X = 0), (C = O = (M + S) / 2));
                    }
                    var W = k * h(C),
                        Z = k * a(C),
                        F = w * h(z),
                        H = w * a(z);
                    if (B > c) {
                        var Q,
                            G = k * h(O),
                            J = k * a(O),
                            K = w * h(R),
                            U = w * a(R);
                        if ($ < u)
                            if (
                                (Q = (function (t, i, n, e, s, o, h, _) {
                                    var r = n - t,
                                        a = e - i,
                                        l = h - s,
                                        u = _ - o,
                                        f = u * r - l * a;
                                    if (!(f * f < c))
                                        return [
                                            t + (f = (l * (i - o) - u * (t - s)) / f) * r,
                                            i + f * a,
                                        ];
                                })(W, Z, K, U, G, J, F, H))
                            ) {
                                var tt = W - Q[0],
                                    it = Z - Q[1],
                                    nt = G - Q[0],
                                    et = J - Q[1],
                                    st =
                                        1 /
                                        a(
                                            ((m =
                                                (tt * nt + it * et) /
                                                (l(tt * tt + it * it) * l(nt * nt + et * et))) > 1
                                                ? 0
                                                : m < -1
                                                  ? u
                                                  : Math.acos(m)) / 2,
                                        ),
                                    ot = l(Q[0] * Q[0] + Q[1] * Q[1]);
                                (L = r(B, (w - ot) / (st - 1))), (I = r(B, (k - ot) / (st + 1)));
                            } else L = I = 0;
                    }
                    X > c
                        ? I > c
                            ? ((P = N(K, U, W, Z, k, I, E)),
                              (A = N(G, J, F, H, k, I, E)),
                              T.moveTo(P.cx + P.x01, P.cy + P.y01),
                              I < B
                                  ? T.arc(P.cx, P.cy, I, o(P.y01, P.x01), o(A.y01, A.x01), !E)
                                  : (T.arc(P.cx, P.cy, I, o(P.y01, P.x01), o(P.y11, P.x11), !E),
                                    T.arc(
                                        0,
                                        0,
                                        k,
                                        o(P.cy + P.y11, P.cx + P.x11),
                                        o(A.cy + A.y11, A.cx + A.x11),
                                        !E,
                                    ),
                                    T.arc(A.cx, A.cy, I, o(A.y11, A.x11), o(A.y01, A.x01), !E)))
                            : (T.moveTo(W, Z), T.arc(0, 0, k, C, O, !E))
                        : T.moveTo(W, Z),
                        w > c && q > c
                            ? L > c
                                ? ((P = N(F, H, G, J, w, -L, E)),
                                  (A = N(W, Z, K, U, w, -L, E)),
                                  T.lineTo(P.cx + P.x01, P.cy + P.y01),
                                  L < B
                                      ? T.arc(P.cx, P.cy, L, o(P.y01, P.x01), o(A.y01, A.x01), !E)
                                      : (T.arc(P.cx, P.cy, L, o(P.y01, P.x01), o(P.y11, P.x11), !E),
                                        T.arc(
                                            0,
                                            0,
                                            w,
                                            o(P.cy + P.y11, P.cx + P.x11),
                                            o(A.cy + A.y11, A.cx + A.x11),
                                            E,
                                        ),
                                        T.arc(A.cx, A.cy, L, o(A.y11, A.x11), o(A.y01, A.x01), !E)))
                                : T.arc(0, 0, w, z, R, E)
                            : T.lineTo(F, H);
                }
            else T.moveTo(0, 0);
            if ((T.closePath(), e)) return (T = null), e + '' || null;
        }
        return (
            (b.centroid = function () {
                var n = (+t.apply(this, arguments) + +i.apply(this, arguments)) / 2,
                    e = (+p.apply(this, arguments) + +d.apply(this, arguments)) / 2 - u / 2;
                return [h(e) * n, a(e) * n];
            }),
            (b.innerRadius = function (i) {
                return arguments.length ? ((t = 'function' == typeof i ? i : e(+i)), b) : t;
            }),
            (b.outerRadius = function (t) {
                return arguments.length ? ((i = 'function' == typeof t ? t : e(+t)), b) : i;
            }),
            (b.cornerRadius = function (t) {
                return arguments.length ? ((n = 'function' == typeof t ? t : e(+t)), b) : n;
            }),
            (b.padRadius = function (t) {
                return arguments.length
                    ? ((_ = null == t ? null : 'function' == typeof t ? t : e(+t)), b)
                    : _;
            }),
            (b.startAngle = function (t) {
                return arguments.length ? ((p = 'function' == typeof t ? t : e(+t)), b) : p;
            }),
            (b.endAngle = function (t) {
                return arguments.length ? ((d = 'function' == typeof t ? t : e(+t)), b) : d;
            }),
            (b.padAngle = function (t) {
                return arguments.length ? ((v = 'function' == typeof t ? t : e(+t)), b) : v;
            }),
            (b.context = function (t) {
                return arguments.length ? ((T = null == t ? null : t), b) : T;
            }),
            b
        );
    }
    b.prototype;
    var P = Array.prototype.slice;
    function A(t) {
        return 'object' == typeof t && 'length' in t ? t : Array.from(t);
    }
    function C(t) {
        this._context = t;
    }
    function O(t) {
        return new C(t);
    }
    function R(t) {
        return t[0];
    }
    function z(t) {
        return t[1];
    }
    function q(t, i) {
        var n = e(!0),
            s = null,
            o = O,
            h = null,
            _ = m(r);
        function r(e) {
            var r,
                a,
                l,
                c = (e = A(e)).length,
                u = !1;
            for (null == s && (h = o((l = _()))), r = 0; r <= c; ++r)
                !(r < c && n((a = e[r]), r, e)) === u && ((u = !u) ? h.lineStart() : h.lineEnd()),
                    u && h.point(+t(a, r, e), +i(a, r, e));
            if (l) return (h = null), l + '' || null;
        }
        return (
            (t = 'function' == typeof t ? t : void 0 === t ? R : e(t)),
            (i = 'function' == typeof i ? i : void 0 === i ? z : e(i)),
            (r.x = function (i) {
                return arguments.length ? ((t = 'function' == typeof i ? i : e(+i)), r) : t;
            }),
            (r.y = function (t) {
                return arguments.length ? ((i = 'function' == typeof t ? t : e(+t)), r) : i;
            }),
            (r.defined = function (t) {
                return arguments.length ? ((n = 'function' == typeof t ? t : e(!!t)), r) : n;
            }),
            (r.curve = function (t) {
                return arguments.length ? ((o = t), null != s && (h = o(s)), r) : o;
            }),
            (r.context = function (t) {
                return arguments.length ? (null == t ? (s = h = null) : (h = o((s = t))), r) : s;
            }),
            r
        );
    }
    function X(t, i, n) {
        var s = null,
            o = e(!0),
            h = null,
            _ = O,
            r = null,
            a = m(l);
        function l(e) {
            var l,
                c,
                u,
                f,
                y,
                x = (e = A(e)).length,
                p = !1,
                d = new Array(x),
                v = new Array(x);
            for (null == h && (r = _((y = a()))), l = 0; l <= x; ++l) {
                if (!(l < x && o((f = e[l]), l, e)) === p)
                    if ((p = !p)) (c = l), r.areaStart(), r.lineStart();
                    else {
                        for (r.lineEnd(), r.lineStart(), u = l - 1; u >= c; --u)
                            r.point(d[u], v[u]);
                        r.lineEnd(), r.areaEnd();
                    }
                p &&
                    ((d[l] = +t(f, l, e)),
                    (v[l] = +i(f, l, e)),
                    r.point(s ? +s(f, l, e) : d[l], n ? +n(f, l, e) : v[l]));
            }
            if (y) return (r = null), y + '' || null;
        }
        function c() {
            return q().defined(o).curve(_).context(h);
        }
        return (
            (t = 'function' == typeof t ? t : void 0 === t ? R : e(+t)),
            (i = 'function' == typeof i ? i : e(void 0 === i ? 0 : +i)),
            (n = 'function' == typeof n ? n : void 0 === n ? z : e(+n)),
            (l.x = function (i) {
                return arguments.length
                    ? ((t = 'function' == typeof i ? i : e(+i)), (s = null), l)
                    : t;
            }),
            (l.x0 = function (i) {
                return arguments.length ? ((t = 'function' == typeof i ? i : e(+i)), l) : t;
            }),
            (l.x1 = function (t) {
                return arguments.length
                    ? ((s = null == t ? null : 'function' == typeof t ? t : e(+t)), l)
                    : s;
            }),
            (l.y = function (t) {
                return arguments.length
                    ? ((i = 'function' == typeof t ? t : e(+t)), (n = null), l)
                    : i;
            }),
            (l.y0 = function (t) {
                return arguments.length ? ((i = 'function' == typeof t ? t : e(+t)), l) : i;
            }),
            (l.y1 = function (t) {
                return arguments.length
                    ? ((n = null == t ? null : 'function' == typeof t ? t : e(+t)), l)
                    : n;
            }),
            (l.lineX0 = l.lineY0 =
                function () {
                    return c().x(t).y(i);
                }),
            (l.lineY1 = function () {
                return c().x(t).y(n);
            }),
            (l.lineX1 = function () {
                return c().x(s).y(i);
            }),
            (l.defined = function (t) {
                return arguments.length ? ((o = 'function' == typeof t ? t : e(!!t)), l) : o;
            }),
            (l.curve = function (t) {
                return arguments.length ? ((_ = t), null != h && (r = _(h)), l) : _;
            }),
            (l.context = function (t) {
                return arguments.length ? (null == t ? (h = r = null) : (r = _((h = t))), l) : h;
            }),
            l
        );
    }
    function Y(t, i) {
        return i < t ? -1 : i > t ? 1 : i >= t ? 0 : NaN;
    }
    function j(t) {
        return t;
    }
    function B() {
        var t = j,
            i = Y,
            n = null,
            s = e(0),
            o = e(y),
            h = e(0);
        function _(e) {
            var _,
                r,
                a,
                l,
                c,
                u = (e = A(e)).length,
                f = 0,
                x = new Array(u),
                p = new Array(u),
                d = +s.apply(this, arguments),
                v = Math.min(y, Math.max(-y, o.apply(this, arguments) - d)),
                T = Math.min(Math.abs(v) / u, h.apply(this, arguments)),
                g = T * (v < 0 ? -1 : 1);
            for (_ = 0; _ < u; ++_) (c = p[(x[_] = _)] = +t(e[_], _, e)) > 0 && (f += c);
            for (
                null != i
                    ? x.sort(function (t, n) {
                          return i(p[t], p[n]);
                      })
                    : null != n &&
                      x.sort(function (t, i) {
                          return n(e[t], e[i]);
                      }),
                    _ = 0,
                    a = f ? (v - u * g) / f : 0;
                _ < u;
                ++_, d = l
            )
                (r = x[_]),
                    (l = d + ((c = p[r]) > 0 ? c * a : 0) + g),
                    (p[r] = {
                        data: e[r],
                        index: _,
                        value: c,
                        startAngle: d,
                        endAngle: l,
                        padAngle: T,
                    });
            return p;
        }
        return (
            (_.value = function (i) {
                return arguments.length ? ((t = 'function' == typeof i ? i : e(+i)), _) : t;
            }),
            (_.sortValues = function (t) {
                return arguments.length ? ((i = t), (n = null), _) : i;
            }),
            (_.sort = function (t) {
                return arguments.length ? ((n = t), (i = null), _) : n;
            }),
            (_.startAngle = function (t) {
                return arguments.length ? ((s = 'function' == typeof t ? t : e(+t)), _) : s;
            }),
            (_.endAngle = function (t) {
                return arguments.length ? ((o = 'function' == typeof t ? t : e(+t)), _) : o;
            }),
            (_.padAngle = function (t) {
                return arguments.length ? ((h = 'function' == typeof t ? t : e(+t)), _) : h;
            }),
            _
        );
    }
    C.prototype = {
        areaStart: function () {
            this._line = 0;
        },
        areaEnd: function () {
            this._line = NaN;
        },
        lineStart: function () {
            this._point = 0;
        },
        lineEnd: function () {
            (this._line || (0 !== this._line && 1 === this._point)) && this._context.closePath(),
                (this._line = 1 - this._line);
        },
        point: function (t, i) {
            switch (((t = +t), (i = +i), this._point)) {
                case 0:
                    (this._point = 1),
                        this._line ? this._context.lineTo(t, i) : this._context.moveTo(t, i);
                    break;
                case 1:
                    this._point = 2;
                default:
                    this._context.lineTo(t, i);
            }
        },
    };
    var L = D(O);
    function I(t) {
        this._curve = t;
    }
    function D(t) {
        function i(i) {
            return new I(t(i));
        }
        return (i._curve = t), i;
    }
    function V(t) {
        var i = t.curve;
        return (
            (t.angle = t.x),
            delete t.x,
            (t.radius = t.y),
            delete t.y,
            (t.curve = function (t) {
                return arguments.length ? i(D(t)) : i()._curve;
            }),
            t
        );
    }
    function W() {
        return V(q().curve(L));
    }
    function Z() {
        var t = X().curve(L),
            i = t.curve,
            n = t.lineX0,
            e = t.lineX1,
            s = t.lineY0,
            o = t.lineY1;
        return (
            (t.angle = t.x),
            delete t.x,
            (t.startAngle = t.x0),
            delete t.x0,
            (t.endAngle = t.x1),
            delete t.x1,
            (t.radius = t.y),
            delete t.y,
            (t.innerRadius = t.y0),
            delete t.y0,
            (t.outerRadius = t.y1),
            delete t.y1,
            (t.lineStartAngle = function () {
                return V(n());
            }),
            delete t.lineX0,
            (t.lineEndAngle = function () {
                return V(e());
            }),
            delete t.lineX1,
            (t.lineInnerRadius = function () {
                return V(s());
            }),
            delete t.lineY0,
            (t.lineOuterRadius = function () {
                return V(o());
            }),
            delete t.lineY1,
            (t.curve = function (t) {
                return arguments.length ? i(D(t)) : i()._curve;
            }),
            t
        );
    }
    function F(t, i) {
        return [(i = +i) * Math.cos((t -= Math.PI / 2)), i * Math.sin(t)];
    }
    I.prototype = {
        areaStart: function () {
            this._curve.areaStart();
        },
        areaEnd: function () {
            this._curve.areaEnd();
        },
        lineStart: function () {
            this._curve.lineStart();
        },
        lineEnd: function () {
            this._curve.lineEnd();
        },
        point: function (t, i) {
            this._curve.point(i * Math.sin(t), i * -Math.cos(t));
        },
    };
    class H {
        constructor(t, i) {
            (this._context = t), (this._x = i);
        }
        areaStart() {
            this._line = 0;
        }
        areaEnd() {
            this._line = NaN;
        }
        lineStart() {
            this._point = 0;
        }
        lineEnd() {
            (this._line || (0 !== this._line && 1 === this._point)) && this._context.closePath(),
                (this._line = 1 - this._line);
        }
        point(t, i) {
            switch (((t = +t), (i = +i), this._point)) {
                case 0:
                    (this._point = 1),
                        this._line ? this._context.lineTo(t, i) : this._context.moveTo(t, i);
                    break;
                case 1:
                    this._point = 2;
                default:
                    this._x
                        ? this._context.bezierCurveTo(
                              (this._x0 = (this._x0 + t) / 2),
                              this._y0,
                              this._x0,
                              i,
                              t,
                              i,
                          )
                        : this._context.bezierCurveTo(
                              this._x0,
                              (this._y0 = (this._y0 + i) / 2),
                              t,
                              this._y0,
                              t,
                              i,
                          );
            }
            (this._x0 = t), (this._y0 = i);
        }
    }
    class Q {
        constructor(t) {
            this._context = t;
        }
        lineStart() {
            this._point = 0;
        }
        lineEnd() {}
        point(t, i) {
            if (((t = +t), (i = +i), 0 === this._point)) this._point = 1;
            else {
                const n = F(this._x0, this._y0),
                    e = F(this._x0, (this._y0 = (this._y0 + i) / 2)),
                    s = F(t, this._y0),
                    o = F(t, i);
                this._context.moveTo(...n), this._context.bezierCurveTo(...e, ...s, ...o);
            }
            (this._x0 = t), (this._y0 = i);
        }
    }
    function G(t) {
        return new H(t, !0);
    }
    function J(t) {
        return new H(t, !1);
    }
    function K(t) {
        return new Q(t);
    }
    function U(t) {
        return t.source;
    }
    function tt(t) {
        return t.target;
    }
    function it(t) {
        let i = U,
            n = tt,
            s = R,
            o = z,
            h = null,
            _ = null,
            r = m(a);
        function a() {
            let e;
            const a = P.call(arguments),
                l = i.apply(this, a),
                c = n.apply(this, a);
            if (
                (null == h && (_ = t((e = r()))),
                _.lineStart(),
                (a[0] = l),
                _.point(+s.apply(this, a), +o.apply(this, a)),
                (a[0] = c),
                _.point(+s.apply(this, a), +o.apply(this, a)),
                _.lineEnd(),
                e)
            )
                return (_ = null), e + '' || null;
        }
        return (
            (a.source = function (t) {
                return arguments.length ? ((i = t), a) : i;
            }),
            (a.target = function (t) {
                return arguments.length ? ((n = t), a) : n;
            }),
            (a.x = function (t) {
                return arguments.length ? ((s = 'function' == typeof t ? t : e(+t)), a) : s;
            }),
            (a.y = function (t) {
                return arguments.length ? ((o = 'function' == typeof t ? t : e(+t)), a) : o;
            }),
            (a.context = function (i) {
                return arguments.length ? (null == i ? (h = _ = null) : (_ = t((h = i))), a) : h;
            }),
            a
        );
    }
    function nt() {
        return it(G);
    }
    function et() {
        return it(J);
    }
    function st() {
        const t = it(K);
        return (t.angle = t.x), delete t.x, (t.radius = t.y), delete t.y, t;
    }
    const ot = l(3),
        ht = {
            draw(t, i) {
                const n = 0.59436 * l(i + r(i / 28, 0.75)),
                    e = n / 2,
                    s = e * ot;
                t.moveTo(0, n),
                    t.lineTo(0, -n),
                    t.moveTo(-s, -e),
                    t.lineTo(s, e),
                    t.moveTo(-s, e),
                    t.lineTo(s, -e);
            },
        },
        _t = {
            draw(t, i) {
                const n = l(i / u);
                t.moveTo(n, 0), t.arc(0, 0, n, 0, y);
            },
        },
        rt = {
            draw(t, i) {
                const n = l(i / 5) / 2;
                t.moveTo(-3 * n, -n),
                    t.lineTo(-n, -n),
                    t.lineTo(-n, -3 * n),
                    t.lineTo(n, -3 * n),
                    t.lineTo(n, -n),
                    t.lineTo(3 * n, -n),
                    t.lineTo(3 * n, n),
                    t.lineTo(n, n),
                    t.lineTo(n, 3 * n),
                    t.lineTo(-n, 3 * n),
                    t.lineTo(-n, n),
                    t.lineTo(-3 * n, n),
                    t.closePath();
            },
        },
        at = l(1 / 3),
        lt = 2 * at,
        ct = {
            draw(t, i) {
                const n = l(i / lt),
                    e = n * at;
                t.moveTo(0, -n), t.lineTo(e, 0), t.lineTo(0, n), t.lineTo(-e, 0), t.closePath();
            },
        },
        ut = {
            draw(t, i) {
                const n = 0.62625 * l(i);
                t.moveTo(0, -n), t.lineTo(n, 0), t.lineTo(0, n), t.lineTo(-n, 0), t.closePath();
            },
        },
        ft = {
            draw(t, i) {
                const n = 0.87559 * l(i - r(i / 7, 2));
                t.moveTo(-n, 0), t.lineTo(n, 0), t.moveTo(0, n), t.lineTo(0, -n);
            },
        },
        yt = {
            draw(t, i) {
                const n = l(i),
                    e = -n / 2;
                t.rect(e, e, n, n);
            },
        },
        xt = {
            draw(t, i) {
                const n = 0.4431 * l(i);
                t.moveTo(n, n), t.lineTo(n, -n), t.lineTo(-n, -n), t.lineTo(-n, n), t.closePath();
            },
        },
        pt = a(u / 10) / a((7 * u) / 10),
        dt = a(y / 10) * pt,
        vt = -h(y / 10) * pt,
        Tt = {
            draw(t, i) {
                const n = l(0.8908130915292852 * i),
                    e = dt * n,
                    s = vt * n;
                t.moveTo(0, -n), t.lineTo(e, s);
                for (let i = 1; i < 5; ++i) {
                    const o = (y * i) / 5,
                        _ = h(o),
                        r = a(o);
                    t.lineTo(r * n, -_ * n), t.lineTo(_ * e - r * s, r * e + _ * s);
                }
                t.closePath();
            },
        },
        gt = l(3),
        bt = {
            draw(t, i) {
                const n = -l(i / (3 * gt));
                t.moveTo(0, 2 * n), t.lineTo(-gt * n, -n), t.lineTo(gt * n, -n), t.closePath();
            },
        },
        mt = l(3),
        wt = {
            draw(t, i) {
                const n = 0.6824 * l(i),
                    e = n / 2,
                    s = (n * mt) / 2;
                t.moveTo(0, -n), t.lineTo(s, e), t.lineTo(-s, e), t.closePath();
            },
        },
        kt = -0.5,
        Mt = l(3) / 2,
        St = 1 / l(12),
        $t = 3 * (St / 2 + 1),
        Nt = {
            draw(t, i) {
                const n = l(i / $t),
                    e = n / 2,
                    s = n * St,
                    o = e,
                    h = n * St + n,
                    _ = -o,
                    r = h;
                t.moveTo(e, s),
                    t.lineTo(o, h),
                    t.lineTo(_, r),
                    t.lineTo(kt * e - Mt * s, Mt * e + kt * s),
                    t.lineTo(kt * o - Mt * h, Mt * o + kt * h),
                    t.lineTo(kt * _ - Mt * r, Mt * _ + kt * r),
                    t.lineTo(kt * e + Mt * s, kt * s - Mt * e),
                    t.lineTo(kt * o + Mt * h, kt * h - Mt * o),
                    t.lineTo(kt * _ + Mt * r, kt * r - Mt * _),
                    t.closePath();
            },
        },
        Et = {
            draw(t, i) {
                const n = 0.6189 * l(i - r(i / 6, 1.7));
                t.moveTo(-n, -n), t.lineTo(n, n), t.moveTo(-n, n), t.lineTo(n, -n);
            },
        },
        Pt = [_t, rt, ct, yt, Tt, bt, Nt],
        At = [_t, ft, Et, wt, ht, xt, ut];
    function Ct(t, i) {
        let n = null,
            s = m(o);
        function o() {
            let e;
            if (
                (n || (n = e = s()), t.apply(this, arguments).draw(n, +i.apply(this, arguments)), e)
            )
                return (n = null), e + '' || null;
        }
        return (
            (t = 'function' == typeof t ? t : e(t || _t)),
            (i = 'function' == typeof i ? i : e(void 0 === i ? 64 : +i)),
            (o.type = function (i) {
                return arguments.length ? ((t = 'function' == typeof i ? i : e(i)), o) : t;
            }),
            (o.size = function (t) {
                return arguments.length ? ((i = 'function' == typeof t ? t : e(+t)), o) : i;
            }),
            (o.context = function (t) {
                return arguments.length ? ((n = null == t ? null : t), o) : n;
            }),
            o
        );
    }
    function Ot() {}
    function Rt(t, i, n) {
        t._context.bezierCurveTo(
            (2 * t._x0 + t._x1) / 3,
            (2 * t._y0 + t._y1) / 3,
            (t._x0 + 2 * t._x1) / 3,
            (t._y0 + 2 * t._y1) / 3,
            (t._x0 + 4 * t._x1 + i) / 6,
            (t._y0 + 4 * t._y1 + n) / 6,
        );
    }
    function zt(t) {
        this._context = t;
    }
    function qt(t) {
        return new zt(t);
    }
    function Xt(t) {
        this._context = t;
    }
    function Yt(t) {
        return new Xt(t);
    }
    function jt(t) {
        this._context = t;
    }
    function Bt(t) {
        return new jt(t);
    }
    function Lt(t, i) {
        (this._basis = new zt(t)), (this._beta = i);
    }
    (zt.prototype = {
        areaStart: function () {
            this._line = 0;
        },
        areaEnd: function () {
            this._line = NaN;
        },
        lineStart: function () {
            (this._x0 = this._x1 = this._y0 = this._y1 = NaN), (this._point = 0);
        },
        lineEnd: function () {
            switch (this._point) {
                case 3:
                    Rt(this, this._x1, this._y1);
                case 2:
                    this._context.lineTo(this._x1, this._y1);
            }
            (this._line || (0 !== this._line && 1 === this._point)) && this._context.closePath(),
                (this._line = 1 - this._line);
        },
        point: function (t, i) {
            switch (((t = +t), (i = +i), this._point)) {
                case 0:
                    (this._point = 1),
                        this._line ? this._context.lineTo(t, i) : this._context.moveTo(t, i);
                    break;
                case 1:
                    this._point = 2;
                    break;
                case 2:
                    (this._point = 3),
                        this._context.lineTo(
                            (5 * this._x0 + this._x1) / 6,
                            (5 * this._y0 + this._y1) / 6,
                        );
                default:
                    Rt(this, t, i);
            }
            (this._x0 = this._x1), (this._x1 = t), (this._y0 = this._y1), (this._y1 = i);
        },
    }),
        (Xt.prototype = {
            areaStart: Ot,
            areaEnd: Ot,
            lineStart: function () {
                (this._x0 =
                    this._x1 =
                    this._x2 =
                    this._x3 =
                    this._x4 =
                    this._y0 =
                    this._y1 =
                    this._y2 =
                    this._y3 =
                    this._y4 =
                        NaN),
                    (this._point = 0);
            },
            lineEnd: function () {
                switch (this._point) {
                    case 1:
                        this._context.moveTo(this._x2, this._y2), this._context.closePath();
                        break;
                    case 2:
                        this._context.moveTo(
                            (this._x2 + 2 * this._x3) / 3,
                            (this._y2 + 2 * this._y3) / 3,
                        ),
                            this._context.lineTo(
                                (this._x3 + 2 * this._x2) / 3,
                                (this._y3 + 2 * this._y2) / 3,
                            ),
                            this._context.closePath();
                        break;
                    case 3:
                        this.point(this._x2, this._y2),
                            this.point(this._x3, this._y3),
                            this.point(this._x4, this._y4);
                }
            },
            point: function (t, i) {
                switch (((t = +t), (i = +i), this._point)) {
                    case 0:
                        (this._point = 1), (this._x2 = t), (this._y2 = i);
                        break;
                    case 1:
                        (this._point = 2), (this._x3 = t), (this._y3 = i);
                        break;
                    case 2:
                        (this._point = 3),
                            (this._x4 = t),
                            (this._y4 = i),
                            this._context.moveTo(
                                (this._x0 + 4 * this._x1 + t) / 6,
                                (this._y0 + 4 * this._y1 + i) / 6,
                            );
                        break;
                    default:
                        Rt(this, t, i);
                }
                (this._x0 = this._x1), (this._x1 = t), (this._y0 = this._y1), (this._y1 = i);
            },
        }),
        (jt.prototype = {
            areaStart: function () {
                this._line = 0;
            },
            areaEnd: function () {
                this._line = NaN;
            },
            lineStart: function () {
                (this._x0 = this._x1 = this._y0 = this._y1 = NaN), (this._point = 0);
            },
            lineEnd: function () {
                (this._line || (0 !== this._line && 3 === this._point)) &&
                    this._context.closePath(),
                    (this._line = 1 - this._line);
            },
            point: function (t, i) {
                switch (((t = +t), (i = +i), this._point)) {
                    case 0:
                        this._point = 1;
                        break;
                    case 1:
                        this._point = 2;
                        break;
                    case 2:
                        this._point = 3;
                        var n = (this._x0 + 4 * this._x1 + t) / 6,
                            e = (this._y0 + 4 * this._y1 + i) / 6;
                        this._line ? this._context.lineTo(n, e) : this._context.moveTo(n, e);
                        break;
                    case 3:
                        this._point = 4;
                    default:
                        Rt(this, t, i);
                }
                (this._x0 = this._x1), (this._x1 = t), (this._y0 = this._y1), (this._y1 = i);
            },
        }),
        (Lt.prototype = {
            lineStart: function () {
                (this._x = []), (this._y = []), this._basis.lineStart();
            },
            lineEnd: function () {
                var t = this._x,
                    i = this._y,
                    n = t.length - 1;
                if (n > 0)
                    for (var e, s = t[0], o = i[0], h = t[n] - s, _ = i[n] - o, r = -1; ++r <= n; )
                        (e = r / n),
                            this._basis.point(
                                this._beta * t[r] + (1 - this._beta) * (s + e * h),
                                this._beta * i[r] + (1 - this._beta) * (o + e * _),
                            );
                (this._x = this._y = null), this._basis.lineEnd();
            },
            point: function (t, i) {
                this._x.push(+t), this._y.push(+i);
            },
        });
    const It = (function t(i) {
        function n(t) {
            return 1 === i ? new zt(t) : new Lt(t, i);
        }
        return (
            (n.beta = function (i) {
                return t(+i);
            }),
            n
        );
    })(0.85);
    function Dt(t, i, n) {
        t._context.bezierCurveTo(
            t._x1 + t._k * (t._x2 - t._x0),
            t._y1 + t._k * (t._y2 - t._y0),
            t._x2 + t._k * (t._x1 - i),
            t._y2 + t._k * (t._y1 - n),
            t._x2,
            t._y2,
        );
    }
    function Vt(t, i) {
        (this._context = t), (this._k = (1 - i) / 6);
    }
    Vt.prototype = {
        areaStart: function () {
            this._line = 0;
        },
        areaEnd: function () {
            this._line = NaN;
        },
        lineStart: function () {
            (this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN),
                (this._point = 0);
        },
        lineEnd: function () {
            switch (this._point) {
                case 2:
                    this._context.lineTo(this._x2, this._y2);
                    break;
                case 3:
                    Dt(this, this._x1, this._y1);
            }
            (this._line || (0 !== this._line && 1 === this._point)) && this._context.closePath(),
                (this._line = 1 - this._line);
        },
        point: function (t, i) {
            switch (((t = +t), (i = +i), this._point)) {
                case 0:
                    (this._point = 1),
                        this._line ? this._context.lineTo(t, i) : this._context.moveTo(t, i);
                    break;
                case 1:
                    (this._point = 2), (this._x1 = t), (this._y1 = i);
                    break;
                case 2:
                    this._point = 3;
                default:
                    Dt(this, t, i);
            }
            (this._x0 = this._x1),
                (this._x1 = this._x2),
                (this._x2 = t),
                (this._y0 = this._y1),
                (this._y1 = this._y2),
                (this._y2 = i);
        },
    };
    const Wt = (function t(i) {
        function n(t) {
            return new Vt(t, i);
        }
        return (
            (n.tension = function (i) {
                return t(+i);
            }),
            n
        );
    })(0);
    function Zt(t, i) {
        (this._context = t), (this._k = (1 - i) / 6);
    }
    Zt.prototype = {
        areaStart: Ot,
        areaEnd: Ot,
        lineStart: function () {
            (this._x0 =
                this._x1 =
                this._x2 =
                this._x3 =
                this._x4 =
                this._x5 =
                this._y0 =
                this._y1 =
                this._y2 =
                this._y3 =
                this._y4 =
                this._y5 =
                    NaN),
                (this._point = 0);
        },
        lineEnd: function () {
            switch (this._point) {
                case 1:
                    this._context.moveTo(this._x3, this._y3), this._context.closePath();
                    break;
                case 2:
                    this._context.lineTo(this._x3, this._y3), this._context.closePath();
                    break;
                case 3:
                    this.point(this._x3, this._y3),
                        this.point(this._x4, this._y4),
                        this.point(this._x5, this._y5);
            }
        },
        point: function (t, i) {
            switch (((t = +t), (i = +i), this._point)) {
                case 0:
                    (this._point = 1), (this._x3 = t), (this._y3 = i);
                    break;
                case 1:
                    (this._point = 2), this._context.moveTo((this._x4 = t), (this._y4 = i));
                    break;
                case 2:
                    (this._point = 3), (this._x5 = t), (this._y5 = i);
                    break;
                default:
                    Dt(this, t, i);
            }
            (this._x0 = this._x1),
                (this._x1 = this._x2),
                (this._x2 = t),
                (this._y0 = this._y1),
                (this._y1 = this._y2),
                (this._y2 = i);
        },
    };
    const Ft = (function t(i) {
        function n(t) {
            return new Zt(t, i);
        }
        return (
            (n.tension = function (i) {
                return t(+i);
            }),
            n
        );
    })(0);
    function Ht(t, i) {
        (this._context = t), (this._k = (1 - i) / 6);
    }
    Ht.prototype = {
        areaStart: function () {
            this._line = 0;
        },
        areaEnd: function () {
            this._line = NaN;
        },
        lineStart: function () {
            (this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN),
                (this._point = 0);
        },
        lineEnd: function () {
            (this._line || (0 !== this._line && 3 === this._point)) && this._context.closePath(),
                (this._line = 1 - this._line);
        },
        point: function (t, i) {
            switch (((t = +t), (i = +i), this._point)) {
                case 0:
                    this._point = 1;
                    break;
                case 1:
                    this._point = 2;
                    break;
                case 2:
                    (this._point = 3),
                        this._line
                            ? this._context.lineTo(this._x2, this._y2)
                            : this._context.moveTo(this._x2, this._y2);
                    break;
                case 3:
                    this._point = 4;
                default:
                    Dt(this, t, i);
            }
            (this._x0 = this._x1),
                (this._x1 = this._x2),
                (this._x2 = t),
                (this._y0 = this._y1),
                (this._y1 = this._y2),
                (this._y2 = i);
        },
    };
    const Qt = (function t(i) {
        function n(t) {
            return new Ht(t, i);
        }
        return (
            (n.tension = function (i) {
                return t(+i);
            }),
            n
        );
    })(0);
    function Gt(t, i, n) {
        var e = t._x1,
            s = t._y1,
            o = t._x2,
            h = t._y2;
        if (t._l01_a > c) {
            var _ = 2 * t._l01_2a + 3 * t._l01_a * t._l12_a + t._l12_2a,
                r = 3 * t._l01_a * (t._l01_a + t._l12_a);
            (e = (e * _ - t._x0 * t._l12_2a + t._x2 * t._l01_2a) / r),
                (s = (s * _ - t._y0 * t._l12_2a + t._y2 * t._l01_2a) / r);
        }
        if (t._l23_a > c) {
            var a = 2 * t._l23_2a + 3 * t._l23_a * t._l12_a + t._l12_2a,
                l = 3 * t._l23_a * (t._l23_a + t._l12_a);
            (o = (o * a + t._x1 * t._l23_2a - i * t._l12_2a) / l),
                (h = (h * a + t._y1 * t._l23_2a - n * t._l12_2a) / l);
        }
        t._context.bezierCurveTo(e, s, o, h, t._x2, t._y2);
    }
    function Jt(t, i) {
        (this._context = t), (this._alpha = i);
    }
    Jt.prototype = {
        areaStart: function () {
            this._line = 0;
        },
        areaEnd: function () {
            this._line = NaN;
        },
        lineStart: function () {
            (this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN),
                (this._l01_a =
                    this._l12_a =
                    this._l23_a =
                    this._l01_2a =
                    this._l12_2a =
                    this._l23_2a =
                    this._point =
                        0);
        },
        lineEnd: function () {
            switch (this._point) {
                case 2:
                    this._context.lineTo(this._x2, this._y2);
                    break;
                case 3:
                    this.point(this._x2, this._y2);
            }
            (this._line || (0 !== this._line && 1 === this._point)) && this._context.closePath(),
                (this._line = 1 - this._line);
        },
        point: function (t, i) {
            if (((t = +t), (i = +i), this._point)) {
                var n = this._x2 - t,
                    e = this._y2 - i;
                this._l23_a = Math.sqrt((this._l23_2a = Math.pow(n * n + e * e, this._alpha)));
            }
            switch (this._point) {
                case 0:
                    (this._point = 1),
                        this._line ? this._context.lineTo(t, i) : this._context.moveTo(t, i);
                    break;
                case 1:
                    this._point = 2;
                    break;
                case 2:
                    this._point = 3;
                default:
                    Gt(this, t, i);
            }
            (this._l01_a = this._l12_a),
                (this._l12_a = this._l23_a),
                (this._l01_2a = this._l12_2a),
                (this._l12_2a = this._l23_2a),
                (this._x0 = this._x1),
                (this._x1 = this._x2),
                (this._x2 = t),
                (this._y0 = this._y1),
                (this._y1 = this._y2),
                (this._y2 = i);
        },
    };
    const Kt = (function t(i) {
        function n(t) {
            return i ? new Jt(t, i) : new Vt(t, 0);
        }
        return (
            (n.alpha = function (i) {
                return t(+i);
            }),
            n
        );
    })(0.5);
    function Ut(t, i) {
        (this._context = t), (this._alpha = i);
    }
    Ut.prototype = {
        areaStart: Ot,
        areaEnd: Ot,
        lineStart: function () {
            (this._x0 =
                this._x1 =
                this._x2 =
                this._x3 =
                this._x4 =
                this._x5 =
                this._y0 =
                this._y1 =
                this._y2 =
                this._y3 =
                this._y4 =
                this._y5 =
                    NaN),
                (this._l01_a =
                    this._l12_a =
                    this._l23_a =
                    this._l01_2a =
                    this._l12_2a =
                    this._l23_2a =
                    this._point =
                        0);
        },
        lineEnd: function () {
            switch (this._point) {
                case 1:
                    this._context.moveTo(this._x3, this._y3), this._context.closePath();
                    break;
                case 2:
                    this._context.lineTo(this._x3, this._y3), this._context.closePath();
                    break;
                case 3:
                    this.point(this._x3, this._y3),
                        this.point(this._x4, this._y4),
                        this.point(this._x5, this._y5);
            }
        },
        point: function (t, i) {
            if (((t = +t), (i = +i), this._point)) {
                var n = this._x2 - t,
                    e = this._y2 - i;
                this._l23_a = Math.sqrt((this._l23_2a = Math.pow(n * n + e * e, this._alpha)));
            }
            switch (this._point) {
                case 0:
                    (this._point = 1), (this._x3 = t), (this._y3 = i);
                    break;
                case 1:
                    (this._point = 2), this._context.moveTo((this._x4 = t), (this._y4 = i));
                    break;
                case 2:
                    (this._point = 3), (this._x5 = t), (this._y5 = i);
                    break;
                default:
                    Gt(this, t, i);
            }
            (this._l01_a = this._l12_a),
                (this._l12_a = this._l23_a),
                (this._l01_2a = this._l12_2a),
                (this._l12_2a = this._l23_2a),
                (this._x0 = this._x1),
                (this._x1 = this._x2),
                (this._x2 = t),
                (this._y0 = this._y1),
                (this._y1 = this._y2),
                (this._y2 = i);
        },
    };
    const ti = (function t(i) {
        function n(t) {
            return i ? new Ut(t, i) : new Zt(t, 0);
        }
        return (
            (n.alpha = function (i) {
                return t(+i);
            }),
            n
        );
    })(0.5);
    function ii(t, i) {
        (this._context = t), (this._alpha = i);
    }
    ii.prototype = {
        areaStart: function () {
            this._line = 0;
        },
        areaEnd: function () {
            this._line = NaN;
        },
        lineStart: function () {
            (this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN),
                (this._l01_a =
                    this._l12_a =
                    this._l23_a =
                    this._l01_2a =
                    this._l12_2a =
                    this._l23_2a =
                    this._point =
                        0);
        },
        lineEnd: function () {
            (this._line || (0 !== this._line && 3 === this._point)) && this._context.closePath(),
                (this._line = 1 - this._line);
        },
        point: function (t, i) {
            if (((t = +t), (i = +i), this._point)) {
                var n = this._x2 - t,
                    e = this._y2 - i;
                this._l23_a = Math.sqrt((this._l23_2a = Math.pow(n * n + e * e, this._alpha)));
            }
            switch (this._point) {
                case 0:
                    this._point = 1;
                    break;
                case 1:
                    this._point = 2;
                    break;
                case 2:
                    (this._point = 3),
                        this._line
                            ? this._context.lineTo(this._x2, this._y2)
                            : this._context.moveTo(this._x2, this._y2);
                    break;
                case 3:
                    this._point = 4;
                default:
                    Gt(this, t, i);
            }
            (this._l01_a = this._l12_a),
                (this._l12_a = this._l23_a),
                (this._l01_2a = this._l12_2a),
                (this._l12_2a = this._l23_2a),
                (this._x0 = this._x1),
                (this._x1 = this._x2),
                (this._x2 = t),
                (this._y0 = this._y1),
                (this._y1 = this._y2),
                (this._y2 = i);
        },
    };
    const ni = (function t(i) {
        function n(t) {
            return i ? new ii(t, i) : new Ht(t, 0);
        }
        return (
            (n.alpha = function (i) {
                return t(+i);
            }),
            n
        );
    })(0.5);
    function ei(t) {
        this._context = t;
    }
    function si(t) {
        return new ei(t);
    }
    function oi(t) {
        return t < 0 ? -1 : 1;
    }
    function hi(t, i, n) {
        var e = t._x1 - t._x0,
            s = i - t._x1,
            o = (t._y1 - t._y0) / (e || (s < 0 && -0)),
            h = (n - t._y1) / (s || (e < 0 && -0)),
            _ = (o * s + h * e) / (e + s);
        return (oi(o) + oi(h)) * Math.min(Math.abs(o), Math.abs(h), 0.5 * Math.abs(_)) || 0;
    }
    function _i(t, i) {
        var n = t._x1 - t._x0;
        return n ? ((3 * (t._y1 - t._y0)) / n - i) / 2 : i;
    }
    function ri(t, i, n) {
        var e = t._x0,
            s = t._y0,
            o = t._x1,
            h = t._y1,
            _ = (o - e) / 3;
        t._context.bezierCurveTo(e + _, s + _ * i, o - _, h - _ * n, o, h);
    }
    function ai(t) {
        this._context = t;
    }
    function li(t) {
        this._context = new ci(t);
    }
    function ci(t) {
        this._context = t;
    }
    function ui(t) {
        return new ai(t);
    }
    function fi(t) {
        return new li(t);
    }
    function yi(t) {
        this._context = t;
    }
    function xi(t) {
        var i,
            n,
            e = t.length - 1,
            s = new Array(e),
            o = new Array(e),
            h = new Array(e);
        for (s[0] = 0, o[0] = 2, h[0] = t[0] + 2 * t[1], i = 1; i < e - 1; ++i)
            (s[i] = 1), (o[i] = 4), (h[i] = 4 * t[i] + 2 * t[i + 1]);
        for (s[e - 1] = 2, o[e - 1] = 7, h[e - 1] = 8 * t[e - 1] + t[e], i = 1; i < e; ++i)
            (n = s[i] / o[i - 1]), (o[i] -= n), (h[i] -= n * h[i - 1]);
        for (s[e - 1] = h[e - 1] / o[e - 1], i = e - 2; i >= 0; --i)
            s[i] = (h[i] - s[i + 1]) / o[i];
        for (o[e - 1] = (t[e] + s[e - 1]) / 2, i = 0; i < e - 1; ++i)
            o[i] = 2 * t[i + 1] - s[i + 1];
        return [s, o];
    }
    function pi(t) {
        return new yi(t);
    }
    function di(t, i) {
        (this._context = t), (this._t = i);
    }
    function vi(t) {
        return new di(t, 0.5);
    }
    function Ti(t) {
        return new di(t, 0);
    }
    function gi(t) {
        return new di(t, 1);
    }
    function bi(t, i) {
        if ((s = t.length) > 1)
            for (var n, e, s, o = 1, h = t[i[0]], _ = h.length; o < s; ++o)
                for (e = h, h = t[i[o]], n = 0; n < _; ++n)
                    h[n][1] += h[n][0] = isNaN(e[n][1]) ? e[n][0] : e[n][1];
    }
    function mi(t) {
        for (var i = t.length, n = new Array(i); --i >= 0; ) n[i] = i;
        return n;
    }
    function wi(t, i) {
        return t[i];
    }
    function ki(t) {
        const i = [];
        return (i.key = t), i;
    }
    function Mi() {
        var t = e([]),
            i = mi,
            n = bi,
            s = wi;
        function o(e) {
            var o,
                h,
                _ = Array.from(t.apply(this, arguments), ki),
                r = _.length,
                a = -1;
            for (const t of e)
                for (o = 0, ++a; o < r; ++o) (_[o][a] = [0, +s(t, _[o].key, a, e)]).data = t;
            for (o = 0, h = A(i(_)); o < r; ++o) _[h[o]].index = o;
            return n(_, h), _;
        }
        return (
            (o.keys = function (i) {
                return arguments.length
                    ? ((t = 'function' == typeof i ? i : e(Array.from(i))), o)
                    : t;
            }),
            (o.value = function (t) {
                return arguments.length ? ((s = 'function' == typeof t ? t : e(+t)), o) : s;
            }),
            (o.order = function (t) {
                return arguments.length
                    ? ((i = null == t ? mi : 'function' == typeof t ? t : e(Array.from(t))), o)
                    : i;
            }),
            (o.offset = function (t) {
                return arguments.length ? ((n = null == t ? bi : t), o) : n;
            }),
            o
        );
    }
    function Si(t, i) {
        if ((e = t.length) > 0) {
            for (var n, e, s, o = 0, h = t[0].length; o < h; ++o) {
                for (s = n = 0; n < e; ++n) s += t[n][o][1] || 0;
                if (s) for (n = 0; n < e; ++n) t[n][o][1] /= s;
            }
            bi(t, i);
        }
    }
    function $i(t, i) {
        if ((_ = t.length) > 0)
            for (var n, e, s, o, h, _, r = 0, a = t[i[0]].length; r < a; ++r)
                for (o = h = 0, n = 0; n < _; ++n)
                    (s = (e = t[i[n]][r])[1] - e[0]) > 0
                        ? ((e[0] = o), (e[1] = o += s))
                        : s < 0
                          ? ((e[1] = h), (e[0] = h += s))
                          : ((e[0] = 0), (e[1] = s));
    }
    function Ni(t, i) {
        if ((n = t.length) > 0) {
            for (var n, e = 0, s = t[i[0]], o = s.length; e < o; ++e) {
                for (var h = 0, _ = 0; h < n; ++h) _ += t[h][e][1] || 0;
                s[e][1] += s[e][0] = -_ / 2;
            }
            bi(t, i);
        }
    }
    function Ei(t, i) {
        if ((s = t.length) > 0 && (e = (n = t[i[0]]).length) > 0) {
            for (var n, e, s, o = 0, h = 1; h < e; ++h) {
                for (var _ = 0, r = 0, a = 0; _ < s; ++_) {
                    for (
                        var l = t[i[_]], c = l[h][1] || 0, u = (c - (l[h - 1][1] || 0)) / 2, f = 0;
                        f < _;
                        ++f
                    ) {
                        var y = t[i[f]];
                        u += (y[h][1] || 0) - (y[h - 1][1] || 0);
                    }
                    (r += c), (a += u * c);
                }
                (n[h - 1][1] += n[h - 1][0] = o), r && (o -= a / r);
            }
            (n[h - 1][1] += n[h - 1][0] = o), bi(t, i);
        }
    }
    function Pi(t) {
        var i = t.map(Ai);
        return mi(t).sort(function (t, n) {
            return i[t] - i[n];
        });
    }
    function Ai(t) {
        for (var i, n = -1, e = 0, s = t.length, o = -1 / 0; ++n < s; )
            (i = +t[n][1]) > o && ((o = i), (e = n));
        return e;
    }
    function Ci(t) {
        var i = t.map(Oi);
        return mi(t).sort(function (t, n) {
            return i[t] - i[n];
        });
    }
    function Oi(t) {
        for (var i, n = 0, e = -1, s = t.length; ++e < s; ) (i = +t[e][1]) && (n += i);
        return n;
    }
    function Ri(t) {
        return Ci(t).reverse();
    }
    function zi(t) {
        var i,
            n,
            e = t.length,
            s = t.map(Oi),
            o = Pi(t),
            h = 0,
            _ = 0,
            r = [],
            a = [];
        for (i = 0; i < e; ++i)
            (n = o[i]), h < _ ? ((h += s[n]), r.push(n)) : ((_ += s[n]), a.push(n));
        return a.reverse().concat(r);
    }
    function qi(t) {
        return mi(t).reverse();
    }
    (ei.prototype = {
        areaStart: Ot,
        areaEnd: Ot,
        lineStart: function () {
            this._point = 0;
        },
        lineEnd: function () {
            this._point && this._context.closePath();
        },
        point: function (t, i) {
            (t = +t),
                (i = +i),
                this._point
                    ? this._context.lineTo(t, i)
                    : ((this._point = 1), this._context.moveTo(t, i));
        },
    }),
        (ai.prototype = {
            areaStart: function () {
                this._line = 0;
            },
            areaEnd: function () {
                this._line = NaN;
            },
            lineStart: function () {
                (this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN), (this._point = 0);
            },
            lineEnd: function () {
                switch (this._point) {
                    case 2:
                        this._context.lineTo(this._x1, this._y1);
                        break;
                    case 3:
                        ri(this, this._t0, _i(this, this._t0));
                }
                (this._line || (0 !== this._line && 1 === this._point)) &&
                    this._context.closePath(),
                    (this._line = 1 - this._line);
            },
            point: function (t, i) {
                var n = NaN;
                if (((i = +i), (t = +t) !== this._x1 || i !== this._y1)) {
                    switch (this._point) {
                        case 0:
                            (this._point = 1),
                                this._line
                                    ? this._context.lineTo(t, i)
                                    : this._context.moveTo(t, i);
                            break;
                        case 1:
                            this._point = 2;
                            break;
                        case 2:
                            (this._point = 3), ri(this, _i(this, (n = hi(this, t, i))), n);
                            break;
                        default:
                            ri(this, this._t0, (n = hi(this, t, i)));
                    }
                    (this._x0 = this._x1),
                        (this._x1 = t),
                        (this._y0 = this._y1),
                        (this._y1 = i),
                        (this._t0 = n);
                }
            },
        }),
        ((li.prototype = Object.create(ai.prototype)).point = function (t, i) {
            ai.prototype.point.call(this, i, t);
        }),
        (ci.prototype = {
            moveTo: function (t, i) {
                this._context.moveTo(i, t);
            },
            closePath: function () {
                this._context.closePath();
            },
            lineTo: function (t, i) {
                this._context.lineTo(i, t);
            },
            bezierCurveTo: function (t, i, n, e, s, o) {
                this._context.bezierCurveTo(i, t, e, n, o, s);
            },
        }),
        (yi.prototype = {
            areaStart: function () {
                this._line = 0;
            },
            areaEnd: function () {
                this._line = NaN;
            },
            lineStart: function () {
                (this._x = []), (this._y = []);
            },
            lineEnd: function () {
                var t = this._x,
                    i = this._y,
                    n = t.length;
                if (n)
                    if (
                        (this._line
                            ? this._context.lineTo(t[0], i[0])
                            : this._context.moveTo(t[0], i[0]),
                        2 === n)
                    )
                        this._context.lineTo(t[1], i[1]);
                    else
                        for (var e = xi(t), s = xi(i), o = 0, h = 1; h < n; ++o, ++h)
                            this._context.bezierCurveTo(
                                e[0][o],
                                s[0][o],
                                e[1][o],
                                s[1][o],
                                t[h],
                                i[h],
                            );
                (this._line || (0 !== this._line && 1 === n)) && this._context.closePath(),
                    (this._line = 1 - this._line),
                    (this._x = this._y = null);
            },
            point: function (t, i) {
                this._x.push(+t), this._y.push(+i);
            },
        }),
        (di.prototype = {
            areaStart: function () {
                this._line = 0;
            },
            areaEnd: function () {
                this._line = NaN;
            },
            lineStart: function () {
                (this._x = this._y = NaN), (this._point = 0);
            },
            lineEnd: function () {
                0 < this._t &&
                    this._t < 1 &&
                    2 === this._point &&
                    this._context.lineTo(this._x, this._y),
                    (this._line || (0 !== this._line && 1 === this._point)) &&
                        this._context.closePath(),
                    this._line >= 0 && ((this._t = 1 - this._t), (this._line = 1 - this._line));
            },
            point: function (t, i) {
                switch (((t = +t), (i = +i), this._point)) {
                    case 0:
                        (this._point = 1),
                            this._line ? this._context.lineTo(t, i) : this._context.moveTo(t, i);
                        break;
                    case 1:
                        this._point = 2;
                    default:
                        if (this._t <= 0)
                            this._context.lineTo(this._x, i), this._context.lineTo(t, i);
                        else {
                            var n = this._x * (1 - this._t) + t * this._t;
                            this._context.lineTo(n, this._y), this._context.lineTo(n, i);
                        }
                }
                (this._x = t), (this._y = i);
            },
        });
    const Xi = {...globalThis.d3, ...n};
    for (var Yi in i) this[Yi] = i[Yi];
    i.__esModule && Object.defineProperty(this, '__esModule', {value: !0});
})();
