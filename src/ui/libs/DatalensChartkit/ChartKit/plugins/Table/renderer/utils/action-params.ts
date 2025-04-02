import {pickActionParamsFromParams} from '@gravity-ui/dashkit/helpers';
import type {
    TableCell,
    TableCellsRow,
    TableCommonCell,
    TableHead,
    TableRow,
    TableWidgetEventScope,
} from 'shared';

import type {TableWidgetData} from '../../../../../types';
import type {ActionParamsData} from '../../../../components/Widget/components/Table/utils';
import {
    getActionParams,
    getAdditionalStyles,
} from '../../../../components/Widget/components/Table/utils/action-params';
import type {TData} from '../../renderer/components/Table/types';

import {getRowAsMap} from './migrate-to-old-format';

function getActionParamsEventScope(
    events?: NonNullable<TableWidgetData['config']>['events'],
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
    config: TableWidgetData['config'];
    unresolvedParams: TableWidgetData['unresolvedParams'];
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

export type GetCellActionParamsArgs = {
    actionParamsData: ActionParamsData;
    row?: TData;
    cell?: TableCell;
    head?: TableHead[];
    metaKey?: boolean;
    rows: TableRow[];
};

export function getCellActionParams(args: GetCellActionParamsArgs) {
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
    head?: TableHead[];
    cell?: TableCell;
    hasSomeCellSelected: boolean;
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
