import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {CircleQuestion} from '@gravity-ui/icons';
import {Icon, Sheet, useMobile} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

const i18n = I18n.keyset('components.common.RangeDatepicker');
const b = block('dl-range-datepicker');
const MOBILE_ICON_SIZE = 24;
const EMPTY_CELL_KEY = '__empty__';

type Cell = {
    titleKey: string;
    header?: boolean;
    value?: boolean;
};

const CELLS: Cell[] = [
    {titleKey: 'th_range', header: true},
    {titleKey: 'th_from', header: true},
    {titleKey: 'th_to', header: true},
    {titleKey: 'tc_last_5_min'},
    {titleKey: 'value_now-5m', value: true},
    {titleKey: 'value_now', value: true},
    {titleKey: 'tc_day_so_far'},
    {titleKey: 'value_now/d', value: true},
    {titleKey: 'value_now', value: true},
    {titleKey: 'tc_this_week'},
    {titleKey: 'value_now/w', value: true},
    {titleKey: 'value_now/w', value: true},
    {titleKey: 'tc_week_to_date'},
    {titleKey: 'value_now/w', value: true},
    {titleKey: 'value_now', value: true},
    {titleKey: 'tc_prev_month'},
    {titleKey: 'value_now-1M/M', value: true},
    {titleKey: 'value_now-1M/M', value: true},
];

const MOBILE_ROWS: Cell[][] = CELLS
    // remove the cells with headers
    .slice(3)
    .reduce((rows, cell, i) => {
        // The data in CELLS, excluding headers, has such order:
        // | <description> | <value 'from'> | <value 'to'> | etc
        if (i % 3 === 0) {
            rows[rows.length] = [];
        }

        const rowIndex = rows.length - 1;

        if (rows[rowIndex].length === 1) {
            // Adding an empty cell to get a grid of the form
            // | <description>      |                 |
            // | <value 'from'> | <value 'to'> |
            rows[rowIndex].push({titleKey: EMPTY_CELL_KEY});
        }

        rows[rowIndex].push(cell);

        return rows;
    }, [] as Cell[][]);

const renderDesktopCell = ({titleKey, header, value}: Cell, i: number) => (
    <div key={`${titleKey}-${i}`} className={b('doc-tooltip-table-cell', {header, value})}>
        {i18n(titleKey)}
    </div>
);

const renderDesktopTooltipContent = () => (
    <div className={b('doc-tooltip-table')}>{CELLS.map(renderDesktopCell)}</div>
);

const renderMobileTooltipContentRow = (cells: Cell[], rowIndex: number) => (
    <div key={`mobile-row-${rowIndex}`} className={b('doc-tooltip-table-mobile-row-wrap')}>
        <div className={b('doc-tooltip-table-mobile-row')}>
            {cells.map(({titleKey, value}, cellIndex) => (
                <div
                    key={`${titleKey}-${cellIndex}`}
                    className={b('doc-tooltip-table-mobile-row-cell', {desc: !value})}
                >
                    {titleKey === EMPTY_CELL_KEY ? '' : i18n(titleKey)}
                </div>
            ))}
        </div>
    </div>
);

const renderMobileTooltipContent = () => (
    <div className={b('doc-tooltip-table-mobile')}>
        {MOBILE_ROWS.map(renderMobileTooltipContentRow)}
    </div>
);

const DesktopTooltip = () => (
    <div className={b('doc-tooltip-wrap')}>
        <HelpPopover
            className={b('doc-tooltip')}
            tooltipContentClassName={b('doc-tooltip-popup')}
            content={renderDesktopTooltipContent()}
            placement={['right-start', 'left-start']}
            hasArrow={false}
        />
    </div>
);

const MobileTooltip = () => {
    const [sheetVisible, setSheetVisible] = React.useState(false);

    const showSheet = () => setSheetVisible(true);

    const hideSheet = () => setSheetVisible(false);

    return (
        <div className={b('doc-tooltip-wrap', {mobile: true})} onClick={showSheet}>
            <Icon data={CircleQuestion} size={MOBILE_ICON_SIZE} />
            <Sheet
                id="dl-range-datepicker-doc-sheet"
                className={b('sheet', {doc: true})}
                visible={sheetVisible}
                onClose={hideSheet}
            >
                {renderMobileTooltipContent()}
            </Sheet>
        </div>
    );
};

export const DocTooltip = () => {
    const mobile = useMobile();
    return mobile ? <MobileTooltip /> : <DesktopTooltip />;
};
