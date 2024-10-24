import React from 'react';

import block from 'bem-cn-lite';
import type {DiffTableColumn} from 'shared';

import {numberFormatter} from '../../../../../components/Widget/components/Table/utils/misc';

const b = block('dl-table');

type DiffCellProps = {
    value?: number;
    diff?: number | null;
    column?: DiffTableColumn;
    diffOnly?: boolean;
};

export const DiffCell = (props: DiffCellProps) => {
    const {value = 0, diff, column, diffOnly} = props;

    if (diffOnly && diff === null) {
        return <React.Fragment>{String(diff)}</React.Fragment>;
    }

    const numberFormatOptions = column as DiffTableColumn;

    let diffMod = '';
    let formattedDiff = '';
    if (diff) {
        const formatOptions = {
            ...numberFormatOptions,
            formatter: numberFormatOptions?.diff_formatter,
        };
        formattedDiff = numberFormatter(diff, formatOptions);
        diffMod = diff > 0 ? 'inc' : 'dec';
    }

    return (
        <div className={b('diff-cell')}>
            {!diffOnly && (
                <React.Fragment>{numberFormatter(value, numberFormatOptions)}</React.Fragment>
            )}
            <span className={b('diff-cell-icon', {[diffMod]: true})}>{formattedDiff}</span>
        </div>
    );
};
