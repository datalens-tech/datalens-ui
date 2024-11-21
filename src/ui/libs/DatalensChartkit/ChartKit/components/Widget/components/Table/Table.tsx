import React from 'react';

import {pickActionParamsFromParams} from '@gravity-ui/dashkit/helpers';
import type {DataTableProps, Settings} from '@gravity-ui/react-data-table';
import DataTable from '@gravity-ui/react-data-table';
import block from 'bem-cn-lite';
import get from 'lodash/get';
import {DEFAULT_WIDGET_SIZE} from 'shared';
import type {TableCommonCell, TableHead, TableRow, WidgetSizeType} from 'shared';

import type {ChartKitDataTable, DataTableData} from '../../../../../types';
import {
    CHARTKIT_SCROLLABLE_NODE_CLASSNAME,
    TABLE_DYNAMIC_MIN_SIZE,
} from '../../../../helpers/constants';
import {getRandomCKId} from '../../../../helpers/getRandomCKId';
import {i18n} from '../../../../modules/i18n/i18n';
import Performance from '../../../../modules/perfomance';
import {Loader} from '../../../Loader/Loader';
import {SNAPTER_HTML_CLASSNAME} from '../constants';

import Paginator from './Paginator/Paginator';
import {WrappedHTMLNode} from './WrappedHTMLNode';
import type {TableProps} from './types';
import {
    camelCaseCss,
    concatStrings,
    getColumnsAndNames,
    getIdFromGeneratedName,
    hasGroups,
    isWrappedHTML,
    validateConfigAndData,
} from './utils';
import type {ActionParamsData} from './utils';
import {getActionParamsEventScope} from './utils/action-params';

import './Table.scss';

const b = block('chartkit-table');

type TableState = {
    waitingForFont: boolean;
    // It is necessary for the correct rendering of columns with a set custom width
    // At the first render, this.tableWidth === undefined, which makes it impossible to calculate the width as a percentage
    dataTableRefInitialized: boolean;
};

function attachDrillHandler(cell: TableCommonCell, value: string, tableProps: TableProps) {
    // @ts-ignore
    const level = Number((tableProps.data.params.drillDownLevel || ['0'])[0]);
    const breadcrumbsLength = tableProps.data.config?.drillDown?.breadcrumbs.length;

    if (breadcrumbsLength && level === breadcrumbsLength - 1) {
        return;
    }

    const filters =
        (tableProps.data.params.drillDownFilters as string[]) ||
        new Array(breadcrumbsLength).fill('');

    cell.onClick = {
        action: 'setParams',
        args: {
            drillDownLevel: [String(level + 1)],
            drillDownFilters: filters.map((filter: string, index: number) => {
                if (level === index) {
                    const newFilter = String(value);

                    return newFilter;
                }

                return filter;
            }),
        },
    };
}

function isSubarray(master: string[], sub: string[]) {
    return (
        master.length >= sub.length &&
        sub.every((_, subIndex) => {
            return master[subIndex] === sub[subIndex];
        })
    );
}

function attachTreeHandler(cell: TableCommonCell, tableProps: TableProps) {
    const treeNode = cell.treeNode!;
    const treeState: string[] = ([] as string[])
        .concat(tableProps.data.params.treeState)
        .filter(Boolean);

    const parsedTreeNode: string[] = JSON.parse(treeNode);
    const parsedTreeState: string[][] = treeState.map((jsonArray) => JSON.parse(jsonArray));

    const subarrayIndexes: number[] = [];

    let isTreeNodeInTreeState = false;

    parsedTreeState.forEach((item: string[], index) => {
        if (isSubarray(item, parsedTreeNode)) {
            subarrayIndexes.unshift(index);
            isTreeNodeInTreeState = isTreeNodeInTreeState || item.length === parsedTreeNode.length;
        }
    });

    if (isTreeNodeInTreeState) {
        subarrayIndexes.forEach((index) => {
            treeState.splice(index, 1);
        });
    } else {
        treeState.push(treeNode);
    }

    cell.onClick = {
        action: 'setParams',
        args: {
            treeState,
        },
    };
}

export class Table extends React.PureComponent<TableProps, TableState> {
    state: TableState = {waitingForFont: true, dataTableRefInitialized: false};

    private dataTableRef?: ChartKitDataTable;
    private id?: string;

    componentDidMount() {
        validateConfigAndData({data: this.props.data.data, config: this.props.data.config});

        // after fonts load table is reflowing
        // so now we wait all queued fonts to be ready before trigger onLoad
        document.fonts.ready.finally(() => {
            this.setState({waitingForFont: false}, () => {
                this.onLoad();
                this.props.onChartLoad?.({widget: this.dataTableRef});
            });
        });
    }

    componentDidUpdate(prevProps: TableProps) {
        // requestAnimationFrame adding this callback after DataTable has calculated it's own sizes
        requestAnimationFrame(() => {
            this.onLoad();

            this.props.onRender?.({renderTime: Number(Performance.getDuration(this.getId()))});
        });

        if (prevProps.data !== this.props.data) {
            validateConfigAndData({data: this.props.data.data, config: this.props.data.config});
        }
    }

    render() {
        const {
            data: {config = {}},
        } = this.props;
        const size: WidgetSizeType = get(config, 'size', DEFAULT_WIDGET_SIZE);

        Performance.mark(this.getId(true));

        if (this.state.waitingForFont) {
            return <Loader compact={true} />;
        }

        return (
            <div className={b({size})}>
                <div
                    className={b(
                        'body',
                        concatStrings(SNAPTER_HTML_CLASSNAME, CHARTKIT_SCROLLABLE_NODE_CLASSNAME),
                    )}
                >
                    {this.renderTitle()}
                    {this.renderTable()}
                </div>
                {this.withPaginator && this.renderPaginator()}
            </div>
        );
    }

    private renderTitle() {
        const {
            data: {config: {title} = {}},
        } = this.props;

        if (!title) {
            return null;
        }

        if (isWrappedHTML(title)) {
            return <WrappedHTMLNode as="div" className={b('title')} value={title} />;
        }

        const tableTitle = typeof title === 'string' ? {text: title} : title;

        return (
            <div className={b('title')} style={camelCaseCss(tableTitle.style)}>
                {tableTitle.text}
            </div>
        );
    }

    private renderTable() {
        const {
            data: {
                data: {head = [], rows = [], footer = []},
                config: {sort, order, settings, drillDown, events} = {},
                unresolvedParams,
            },
            onChange,
        } = this.props;
        // dynamicRender, highlightRows, sorting does not work properly if there is a group
        const isHasGroups = hasGroups(head);
        const context = {isHasGroups};
        let actionParamsData: ActionParamsData | undefined;
        const scope = getActionParamsEventScope(events);

        if (scope) {
            actionParamsData = {
                params: pickActionParamsFromParams(unresolvedParams),
                scope,
            };
        }

        const {columns, names, sortSettings} = getColumnsAndNames({
            head,
            rows,
            context,
            tableWidth: this.tableWidth,
            onChange,
            tableRef: this.dataTableRef,
            actionParamsData,
        });

        let initialSortOrder: DataTableProps<DataTableData>['initialSortOrder'];
        const extraProps: Record<string, unknown> = {};
        if (sort) {
            const nameIndex = names.findIndex(
                (generatedName) => getIdFromGeneratedName(generatedName) === sort,
            );
            if (nameIndex !== -1) {
                const columnId = names[nameIndex];

                initialSortOrder = {
                    columnId: names[nameIndex],
                    order: order === 'asc' ? DataTable.ASCENDING : DataTable.DESCENDING,
                };

                // DATAUI-515
                // to update the sort when you update the sort field or update the composite columnId column
                // (for example, the script level leaves the same sort: <id>, but set <id> on another column),
                // otherwise the new value in initialSortOrder will be ignored
                extraProps.key = columnId;
            }
        }

        // Only works for pivot table graph, because they have a custom field in the column.
        // It betrays the meta information needed for the backend
        // And based on it, we set this flag in the getColumnsAndNames function
        if (sortSettings.shouldResetSortOrder) {
            // We have to get into the ref of the table, because if we put sortOrder = undefined, the table still
            // stores the sort value in its state.
            // Reset everything connected with sorting inside TableView.
            this.dataTableRef?.table?.setState({sortColumns: [], sortOrder: {}});
        }

        const formatData = (row: TableRow) => {
            return 'values' in row
                ? row.values.reduce((result: DataTableData, value, index) => {
                      result[names[index]] = {value};
                      return result;
                  }, {})
                : row.cells.reduce((result: DataTableData, value, index) => {
                      // @ts-ignore
                      result[names[index]] = value;

                      if (
                          drillDown &&
                          typeof value === 'object' &&
                          !('onClick' in value) &&
                          'drillDownFilterValue' in value &&
                          value.drillDownFilterValue
                      ) {
                          attachDrillHandler(value, value.drillDownFilterValue, this.props);
                      }

                      if (
                          !drillDown &&
                          typeof value === 'object' &&
                          !('onClick' in value) &&
                          'treeNode' in value &&
                          value.treeNode
                      ) {
                          attachTreeHandler(value, this.props);
                      }

                      return result;
                  }, {});
        };

        const onlyFooterExists = this.withPaginator && rows.length === 0 && footer.length !== 0;

        const data = rows.map(formatData);

        const footerData = footer.map(formatData);

        const dynamicMode = !isHasGroups && data.length > 1000;

        const tableSettings: Settings = {
            displayIndices: false,
            highlightRows: !isHasGroups,
            headerMod: 'multiline',
            // width of the columns is buggy if not static (use on demand)
            dynamicRender: dynamicMode,
            dynamicRenderMinSize: TABLE_DYNAMIC_MIN_SIZE,
            // with dynamicRender, the width of columns in the header and rows is synchronized
            stickyHead: DataTable.MOVING,
            syncHeadOnResize: true,
            // disable front-end sorting table contents when paginator is enabled
            externalSort: this.withPaginator,
            defaultOrder: DataTable.DESCENDING,
            ...settings,
        };

        return (
            <DataTable<DataTableData>
                {...extraProps}
                columns={columns}
                data={data}
                footerData={footerData}
                emptyDataMessage={i18n('chartkit-table', 'message-no-data')}
                settings={tableSettings}
                theme="chartkit"
                initialSortOrder={initialSortOrder}
                sortOrder={sortSettings.manualSortOrder}
                ref={(node) => {
                    if (node) {
                        this.dataTableRef = node;
                        this.setState({dataTableRefInitialized: true});
                    }
                }}
                onSort={tableSettings.externalSort ? this.onSortChange : undefined}
                nullBeforeNumbers
                // To avoid drawing No Data line when after pagination there is only a footer
                renderEmptyRow={onlyFooterExists ? () => null : undefined}
                onError={(error) => {
                    throw error;
                }}
            />
        );
    }

    private renderPaginator() {
        const {
            data: {
                data: {rows},
                params: {_page: currentPage},
                config: {paginator} = {},
            },
        } = this.props;

        return (
            <Paginator
                page={currentPage}
                rowsCount={rows?.length}
                limit={paginator?.limit}
                onChange={this.onPaginatorChange}
            />
        );
    }

    get withPaginator() {
        return Boolean(this.props.data.config?.paginator?.enabled);
    }

    get tableWidth() {
        const table = this.dataTableRef?.table?.table?._body;
        return table?.getBoundingClientRect().width;
    }

    private getId(refresh = false) {
        if (refresh) {
            this.id = getRandomCKId();
        }
        return `${this.props.id}_${this.id}`;
    }

    private onLoad() {
        const widgetRendering = Performance.getDuration(this.getId());

        if (this.props.onLoad) {
            this.props.onLoad({widget: this.dataTableRef, widgetRendering});
        }
    }

    private onPaginatorChange = (page: number) => {
        if (this.props.onChange) {
            this.props.onChange(
                {type: 'PARAMS_CHANGED', data: {params: {_page: String(page)}}},
                {forceUpdate: true},
                true,
            );
        }
    };

    private onSortChange: DataTableProps<DataTableData>['onSort'] = (sortData) => {
        if (sortData) {
            const {columnId: _columnId, order: _sortOrder} =
                (Array.isArray(sortData) ? sortData[0] : sortData) || {};

            const id = getIdFromGeneratedName(_columnId);

            let column: TableHead | undefined;

            const columns = this.props.data?.data?.head || [];

            const searchForColumn = (sub: TableHead[]) => {
                if (column) {
                    return;
                }

                sub.forEach((head) => {
                    if (column) {
                        return;
                    } else if (head.id === id) {
                        column = head;
                        return;
                    } else if ('sub' in head) {
                        searchForColumn(head.sub);
                    }
                });
            };

            searchForColumn(columns);

            if (this.props.onChange) {
                this.props.onChange(
                    {
                        type: 'PARAMS_CHANGED',
                        data: {
                            params: {
                                _columnId,
                                _sortOrder: String(_sortOrder),
                                _sortColumnMeta: JSON.stringify(column?.custom || {}),
                            },
                        },
                    },
                    {forceUpdate: true},
                    true,
                );
            }
        }
    };
}
