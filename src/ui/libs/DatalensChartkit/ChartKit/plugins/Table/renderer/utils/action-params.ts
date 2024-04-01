import {pickActionParamsFromParams} from '@gravity-ui/dashkit';
import type {TableCommonCell, TableWidgetEventScope} from 'shared';
import {TableCell, TableCellsRow, TableHead, TableRow} from 'shared';

import type {TData} from '../../../../../../../components/Table/types';
import type {TableWidget} from '../../../../../types';
import {ActionParamsData} from '../../../../components/Widget/components/Table/utils';
import {
    getActionParams,
    getAdditionalStyles,
} from '../../../../components/Widget/components/Table/utils/action-params';

import {getRowAsMap} from './migrate-to-old-format';

function getActionParamsEventScope(
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

export function getCurrentActionParams(args: {
    config: TableWidget['config'];
    unresolvedParams: TableWidget['unresolvedParams'];
}) {
    const {config, unresolvedParams} = args;
    const scope = getActionParamsEventScope(config?.events);

    if (scope) {
        return {
            params: pickActionParamsFromParams(unresolvedParams),
            scope,
        };
    }

    return undefined;
}

export function getCellActionParams(args: {
    actionParamsData: ActionParamsData;
    row?: TData;
    cell?: TableCell;
    head?: TableHead[];
    metaKey?: boolean;
    rows: TableRow[];
}) {
    const {row, head = [], actionParamsData} = args;

    if (!actionParamsData) {
        return null;
    }

    return getActionParams({
        ...args,
        row: getRowAsMap({row, head}),
    });
}

export function getCellCss(args: {
    actionParamsData?: ActionParamsData;
    row?: TableCellsRow;
    rows: TableRow[];
    head?: TableHead[];
    cell?: TableCell;
}) {
    const {row, head = [], actionParamsData} = args;

    if (!actionParamsData) {
        return {};
    }

    return getAdditionalStyles({
        ...args,
        actionParamsData,
        row: getRowAsMap({row: row?.cells as TableCommonCell[], head}),
    });
}
