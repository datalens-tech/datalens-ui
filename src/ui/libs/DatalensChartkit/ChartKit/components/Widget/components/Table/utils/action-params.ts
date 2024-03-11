import React from 'react';

import {transformParamsToActionParams} from '@gravity-ui/dashkit';
import {Column} from '@gravity-ui/react-data-table';
import clone from 'lodash/clone';
import get from 'lodash/get';
import intersection from 'lodash/intersection';
import without from 'lodash/without';
import {StringParams, TableCell, TableHead, TableRow, TableWidgetEventScope} from 'shared';
import {DataTableData, TableWidget} from 'ui/libs/DatalensChartkit/types';

import {addParams, subtractParameters} from '../../../../../helpers/action-params-handlers';
import {hasMatchedActionParams} from '../../../../../helpers/utils';

import {hasGroups} from './misc';
import {ActionParamsData} from './types';

type ValuesMap = Record<string, {value: number; hashes: string[]}>;

export function getAdditionalStyles(args: {
    actionParamsData: ActionParamsData;
    row?: DataTableData;
    rows: TableRow[];
    head?: TableHead[];
    cell?: TableCell;
}): React.CSSProperties | undefined {
    const {actionParamsData, rows, row, head, cell} = args;

    switch (actionParamsData.scope) {
        case 'row': {
            return getAdditionalStylesByRow({actionParams: actionParamsData.params, row, head});
        }
        case 'cell': {
            return getAdditionalStylesByCell({
                actionParams: actionParamsData.params,
                cell,
                rows,
            });
        }
        // There is no way to reach this code. Just satisfies ts
        default: {
            return undefined;
        }
    }
}

function getAdditionalStylesByRow(args: {
    actionParams: StringParams;
    row?: DataTableData;
    head?: TableHead[];
}): React.CSSProperties | undefined {
    const {actionParams, row, head} = args;
    const rowActionParams = getRowActionParams({row, head});
    const rowSelected = hasMatchedActionParams(rowActionParams, actionParams);
    const actionParamsKeys = Object.keys(actionParams);
    const hasAtLeastOneActionParam =
        actionParamsKeys.length &&
        actionParamsKeys.some((key) => {
            const param = actionParams[key];
            const normalizedParamValue = Array.isArray(param) ? param : [param];
            return Boolean(normalizedParamValue.filter(Boolean).length);
        });

    if (hasAtLeastOneActionParam && !rowSelected) {
        return {
            color: 'var(--g-color-text-hint)',
        };
    }

    return undefined;
}

function getAdditionalStylesByCell(args: {
    actionParams: StringParams;
    cell?: TableCell;
    rows: TableRow[];
}): React.CSSProperties | undefined {
    const {actionParams, cell, rows} = args;

    if (cell) {
        const hasSomeCellSelected = rows.some(
            (r) => 'cells' in r && r.cells.some((c) => isCellSelected(c, actionParams)),
        );

        if (hasSomeCellSelected && !isCellSelected(cell, actionParams)) {
            return {
                opacity: 0.5,
            };
        }
    }

    return undefined;
}

function getSelectedRows(args: {
    actionParamsData: ActionParamsData;
    head?: TableHead[];
    rows: TableRow[];
}) {
    const {actionParamsData, head, rows} = args;
    return rows.filter((row) => {
        if (!('cells' in row)) {
            return false;
        }

        const preparedRow = row.cells.reduce<DataTableData>((acc, cell, i) => {
            acc[`cell-${i}`] = cell;
            return acc;
        }, {});
        const actionParams = getRowActionParams({row: preparedRow, head});

        return Boolean(hasMatchedActionParams(actionParams, actionParamsData?.params));
    });
}

export function getActionParams(args: {
    actionParamsData: ActionParamsData;
    row?: DataTableData;
    column?: Column<DataTableData>;
    head?: TableHead[];
    metaKey?: boolean;
    rows: TableRow[];
}): StringParams {
    const {actionParamsData, row, head, metaKey, rows, column} = args;

    switch (actionParamsData.scope) {
        case 'row': {
            return getUpdatedActionParamsForRowScope({
                actionParams: actionParamsData.params,
                row,
                head,
                metaKey,
                selectedRows: getSelectedRows({actionParamsData, rows, head}),
            });
        }
        case 'cell': {
            const newActionParams = getUpdatedActionParamsForCellScope({
                actionParams: actionParamsData.params,
                row,
                column,
                metaKey,
                rows,
            });

            return transformParamsToActionParams(newActionParams);
        }
        // There is no way to reach this code. Just satisfies ts
        default: {
            return actionParamsData.params;
        }
    }
}

function isCellSelected(cell: TableCell, actionParams: StringParams) {
    return hasMatchedActionParams(extractCellActionParams({cell}), actionParams);
}

function getUpdatedActionParamsForCellScope(args: {
    actionParams: StringParams;
    row?: DataTableData;
    column?: Column<DataTableData>;
    metaKey?: boolean;
    rows: TableRow[];
}) {
    const {actionParams: prevActionParams, row, metaKey, rows, column} = args;
    const multiSelect = Boolean(metaKey);

    let newActionParams: StringParams = prevActionParams;
    const currentCell = row && column?.name ? row[column.name] : null;
    if (!currentCell) {
        return newActionParams;
    }

    const currentCellParams = extractCellActionParams({cell: currentCell});
    const hasSomeCellSelected = rows.some(
        (r) => 'cells' in r && r.cells.some((c) => isCellSelected(c, prevActionParams)),
    );

    if (hasSomeCellSelected) {
        if (isCellSelected(currentCell, prevActionParams)) {
            if (multiSelect) {
                newActionParams = subtractParameters(newActionParams, currentCellParams);
                rows.forEach((r) => {
                    get(r, 'cells', []).forEach((c: TableCell) => {
                        if (isCellSelected(c, newActionParams)) {
                            const cellParams = extractCellActionParams({cell: c});
                            newActionParams = addParams(newActionParams, cellParams);
                        }
                    });
                });
            } else {
                newActionParams = {};
            }
        } else {
            if (!multiSelect) {
                // should remove the selection from the previously selected cells
                rows.forEach((r) => {
                    get(r, 'cells', []).forEach((c: TableCell) => {
                        if (isCellSelected(c, prevActionParams)) {
                            const cellParams = extractCellActionParams({cell: c});
                            newActionParams = subtractParameters(newActionParams, cellParams);
                        }
                    });
                });
            }

            newActionParams = addParams(newActionParams, currentCellParams);
        }
    } else {
        newActionParams = addParams(newActionParams, currentCellParams);
    }

    return newActionParams;
}

function getUpdatedActionParamsForRowScope(args: {
    actionParams: StringParams;
    row?: DataTableData;
    head?: TableHead[];
    metaKey?: boolean;
    selectedRows?: TableRow[];
}): StringParams {
    const {actionParams, row, head, metaKey, selectedRows} = args;

    if (!row) {
        return {};
    }

    const rowActionParams = getRowActionParams({row, head});
    const resultParams = mergeStringParams({
        current: actionParams,
        row: rowActionParams,
        head,
        metaKey,
        selectedRows,
    });

    return transformParamsToActionParams(resultParams);
}

export function getRowActionParams(args: {row?: DataTableData; head?: TableHead[]}): StringParams {
    const {row, head} = args;

    if (!row) {
        return {};
    }

    const canAutoGenerateParams = head && !hasGroups(head);
    return Object.keys(row).reduce<StringParams>((acc, columnName, index) => {
        const cell = row[columnName];
        const headColumn = canAutoGenerateParams ? head?.[index] : undefined;

        return Object.assign(acc, extractCellActionParams({cell, head: headColumn}));
    }, {});
}

function extractCellActionParams(args: {cell: TableCell; head?: TableHead}): StringParams {
    const {cell, head} = args;
    const cellCustomData = get(cell, 'custom');

    if (cellCustomData && 'actionParams' in cellCustomData) {
        return cellCustomData.actionParams;
    }

    if (head?.id) {
        const key = head?.id;
        const value = typeof cell === 'string' ? cell : String(cell.value);

        return {[key]: [value]};
    }

    return {};
}

export function getActionParamsEventScope(
    events?: NonNullable<TableWidget['config']>['events'],
): TableWidgetEventScope | undefined {
    if (!events?.click) {
        return undefined;
    }

    const normalizedEvents = Array.isArray(events.click) ? events.click : [events.click];

    return normalizedEvents.reduce<TableWidgetEventScope | undefined>((_, e) => {
        return e.scope;
    }, undefined);
}

function setMapValue(map: ValuesMap, value: string, hash: string) {
    if (typeof map[value] === 'undefined') {
        // eslint-disable-next-line no-param-reassign
        map[value] = {value: 0, hashes: []};
    }

    if (map[value].hashes.indexOf(hash) === -1) {
        map[value].hashes.push(hash);
    }

    // eslint-disable-next-line no-param-reassign
    map[value].value = map[value].value + 1;
}

function getValuesMap(args: {selectedRows: TableRow[]; head?: TableHead[]}) {
    const {selectedRows, head} = args;

    return selectedRows.reduce<ValuesMap>((acc, row) => {
        if (!('cells' in row)) {
            return acc;
        }

        const rowHash = Object.values(row.cells).reduce<string>((rowHashAcc, cell, i) => {
            const cellParams = extractCellActionParams({cell, head: head?.[i]});
            return rowHashAcc + Object.values(cellParams).join();
        }, '');

        row.cells.forEach((cell, i) => {
            const cellParams = extractCellActionParams({cell, head: head?.[i]});
            Object.values(cellParams).forEach((cellValue) => {
                if (Array.isArray(cellValue)) {
                    cellValue.forEach((value) => {
                        setMapValue(acc, value, rowHash);
                    });
                } else {
                    setMapValue(acc, cellValue, rowHash);
                }
            });
        });

        return acc;
    }, {});
}

function shouldRemoveValue(map: ValuesMap, key: string) {
    return (
        // Value is contained only in one row
        map[key]?.value === 1 ||
        // Values are contained in completely identical rows
        (map[key]?.value > 1 && map[key].hashes.length === 1)
    );
}

function mergeStringParamsByRowDeselecting(args: {
    current: StringParams;
    row: StringParams;
    selectedRows: TableRow[];
    head?: TableHead[];
}) {
    const {current, row, selectedRows, head} = args;
    const valuesMap = getValuesMap({selectedRows, head});
    const hasSelectedRows = Boolean(selectedRows.length);

    return Object.keys(current).reduce<StringParams>((acc, key) => {
        acc[key] = Array.isArray(current[key]) ? current[key] : [current[key] as string];
        const rowKey = Array.isArray(row[key]) ? row[key] : [row[key] as string];
        const intersectedValues = intersection(acc[key], rowKey);

        if (intersectedValues.length) {
            const itemsToFilter = hasSelectedRows
                ? intersectedValues.filter((value) => {
                      return (
                          typeof valuesMap[String(value)]?.value === 'number' &&
                          shouldRemoveValue(valuesMap, String(value))
                      );
                  })
                : intersectedValues;

            acc[key] = without(acc[key], ...itemsToFilter);
            if (!acc[key].length) {
                acc[key] = [''];
            }
        }

        return acc;
    }, {});
}

export function mergeStringParams(args: {
    current: StringParams;
    row: StringParams;
    head?: TableHead[];
    metaKey?: boolean;
    selectedRows?: TableRow[];
}): StringParams {
    const {current, row, metaKey, selectedRows = [], head} = args;
    const isRowAlreadySelected = hasMatchedActionParams(row, current);

    if (metaKey) {
        return isRowAlreadySelected
            ? mergeStringParamsByRowDeselecting({current, row, selectedRows, head})
            : addParams(current, row);
    }

    const result = clone(row);

    if (isRowAlreadySelected) {
        Object.keys(result).forEach((key) => {
            result[key] = [''];
        });
    }

    return result;
}
