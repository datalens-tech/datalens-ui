import React from 'react';

import {Portal} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {COMPONENT_CLASSNAME} from '../../../../../../../../components/Widgets/Chart/helpers/helpers';
import {waitForContent} from '../../../../../helpers/wait-for-content';
import type {WidgetDimensions} from '../../types';

import {TableBody} from './TableBody';
import {TableFooter} from './TableFooter';
import {TableHead} from './TableHead';
import type {TableViewData} from './types';
import {getTableSizes} from './utils';

const b = block('dl-table');

type Props = {
    dimensions: WidgetDimensions;
    data: TableViewData;
    onChangeMinWidth?: (cellSizes: number[]) => void;
    width?: 'auto' | 'max-content';
};

export const BackgroundTable = React.memo<Props>((props: Props) => {
    const {
        dimensions,
        data: {header, body, footer},
        onChangeMinWidth,
        width,
    } = props;

    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const tableRef = React.useRef<HTMLTableElement | null>(null);
    const tableMinSizes = React.useRef<null | number[]>(null);

    const setMinSizes = async () => {
        const tableElement = tableRef.current as HTMLTableElement;
        await waitForContent(tableElement);
        const tableColSizes = getTableSizes(tableElement);
        const prev = tableMinSizes.current;

        if (!prev || tableColSizes.some((s, index) => s > prev[index])) {
            tableMinSizes.current = tableColSizes.map((s, index) => {
                if (!prev || s > prev[index]) {
                    return s;
                }
                return prev[index];
            });

            if (onChangeMinWidth) {
                onChangeMinWidth(tableMinSizes.current ?? []);
            }
        }
    };

    React.useEffect(() => {
        if (tableMinSizes.current) {
            tableMinSizes.current = null;
        }
    }, [props.data.header?.rows]);

    React.useEffect(() => {
        setMinSizes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.data]);

    return (
        <Portal>
            <div
                className={b('background-table', COMPONENT_CLASSNAME)}
                style={{height: dimensions?.height, width: dimensions?.width}}
                ref={containerRef}
            >
                <table className={b({prepared: false})} ref={tableRef} style={{width}}>
                    <TableHead rows={header.rows} />
                    <TableBody rows={body.rows} />
                    <TableFooter rows={footer.rows} />
                </table>
            </div>
        </Portal>
    );
});
BackgroundTable.displayName = 'BackgroundTable';
