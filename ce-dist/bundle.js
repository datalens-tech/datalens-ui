var e = {
        367: function (e, t, r) {
            var a =
                (this && this.__importDefault) ||
                function (e) {
                    return e && e.__esModule ? e : {default: e};
                };
            Object.defineProperty(t, '__esModule', {value: !0}), (t.datasetModule = void 0);
            const i = a(r(887));
            t.datasetModule = i.default;
        },
        887: (e, t) => {
            function r(e, t, r = {}) {
                return (function (e, t, r) {
                    const a = t.reduce((e, t) => ((e[t.legend_item_id] = t), e), {});
                    return e[0].rows.map((e) => {
                        const t = {},
                            i = e.data,
                            o = e.legend;
                        return (
                            i.forEach((e, i) => {
                                const n = a[o[i]],
                                    u = n.title,
                                    l = n.data_type;
                                t[u] = (function (e, t, r) {
                                    return (function (e, t, r) {
                                        if (null === e) return null;
                                        switch (t) {
                                            case 'integer':
                                            case 'uinteger':
                                            case 'float':
                                                return Number(e);
                                            case 'date':
                                            case 'datetime':
                                            case 'genericdatetime':
                                            case 'datetimetz': {
                                                const t = new Date(e);
                                                return (
                                                    r.utc ||
                                                        t.setTime(
                                                            (a = t).getTime() -
                                                                60 * a.getTimezoneOffset() * 1e3,
                                                        ),
                                                    t
                                                );
                                            }
                                            default:
                                                return e;
                                        }
                                        var a;
                                    })(e, t, r);
                                })(e, l, r);
                            }),
                            t
                        );
                    });
                })(e, t, r);
            }
            Object.defineProperty(t, '__esModule', {value: !0}),
                (t.default = {
                    buildSource: function (e) {
                        var t, r, a;
                        const i = e.columns.map((e) => ({
                                ref: {type: 'title', title: e},
                                block_id: 0,
                            })),
                            o =
                                null === (t = e.where) || void 0 === t
                                    ? void 0
                                    : t.map((e) => {
                                          const t = e.type || 'title',
                                              r = e.column || '';
                                          return {
                                              ref:
                                                  'title' === t
                                                      ? {type: 'title', title: r}
                                                      : {type: 'id', id: r},
                                              operation: e.operation,
                                              values: e.values,
                                          };
                                      }),
                            n =
                                null === (r = e.order_by) || void 0 === r
                                    ? void 0
                                    : r.map(({direction: e, column: t}) => ({
                                          ref: {type: 'title', title: t},
                                          direction: e.toLowerCase(),
                                      })),
                            u =
                                null === (a = e.parameters) || void 0 === a
                                    ? void 0
                                    : a.map((e) => ({ref: {type: 'id', id: e.id}, value: e.value}));
                        let l;
                        e.disable_group_by && void 0 !== e.disable_group_by && (l = !0);
                        const d = {
                            fields: i,
                            filters: o,
                            order_by: n,
                            updates: e.updates,
                            parameter_values: u,
                            limit: e.limit,
                            offset: e.offset,
                            disable_group_by: l,
                            autofill_legend: !0,
                        };
                        return (
                            Object.keys(d).forEach((e) => {
                                void 0 === d[e] && delete d[e];
                            }),
                            {
                                url: `/_bi_datasets/${e.id}/result`,
                                method: 'POST',
                                data: d,
                                ui: e.ui,
                                cache: e.cache,
                            }
                        );
                    },
                    processTableData: r,
                    processData: function (e, t = 'dataset', a, i = {}) {
                        var o;
                        const n = e[t];
                        if (a) {
                            const e = n.blocks.map((e) => e.query).join('\n');
                            a.setDataSourceInfo(t, {query: e}),
                                n.data_export_forbidden &&
                                    (null === (o = a.setExtra) ||
                                        void 0 === o ||
                                        o.call(a, 'dataExportForbidden', !0));
                        }
                        return r(n.result_data, n.fields, i);
                    },
                    OPERATIONS: {
                        ISNULL: 'ISNULL',
                        ISNOTNULL: 'ISNOTNULL',
                        GT: 'GT',
                        LT: 'LT',
                        GTE: 'GTE',
                        LTE: 'LTE',
                        EQ: 'EQ',
                        NE: 'NE',
                        STARTSWITH: 'STARTSWITH',
                        ISTARTSWITH: 'ISTARTSWITH',
                        ENDSWITH: 'ENDSWITH',
                        IENDSWITH: 'IENDSWITH',
                        CONTAINS: 'CONTAINS',
                        ICONTAINS: 'ICONTAINS',
                        NOTCONTAINS: 'NOTCONTAINS',
                        NOTICONTAINS: 'NOTICONTAINS',
                        IN: 'IN',
                        NIN: 'NIN',
                        BETWEEN: 'BETWEEN',
                    },
                    ORDERS: {DESC: 'DESC', ASC: 'ASC'},
                });
        },
    },
    t = {},
    r = (function r(a) {
        var i = t[a];
        if (void 0 !== i) return i.exports;
        var o = (t[a] = {exports: {}});
        return e[a].call(o.exports, o, o.exports, r), o.exports;
    })(367);
exports.bundledLibraries = r;
