import type {LineShapeType} from 'shared';
import type {FormatNumberOptions} from 'shared/modules/format-units/types';

import type {WidgetBase} from '../../../../types';

export type TooltipData = {
    /** Array of lines output in the tooltip (see TooltipLine) */
    lines: Array<TooltipLine>;
    /** array of comments (set in the comments dialog) */
    xComments?: Array<{
        /** comment text */
        text: string;
        /** the color displayed above the comment */
        color: string;
    }>;
    /** comment text (set via manageTooltipConfig) */
    commentDateText?: string;
    /**
     * flag indicating that you should always duplicate the active line by displaying it on top of the main list
     * (default * behavior - the active line is displayed on top of the main list only if it "does not fit" in the tooltip)
     */
    activeRowAlwaysFirstInTooltip?: boolean;
    /** flag indicating that the chart is displayed in split tooltip mode */
    splitTooltip?: boolean;
    /** text of the header of the tooltip */
    tooltipHeader?: string;
    /** flag indicating that a column with the line name is displayed in the tooltip */
    shared?: boolean;
    /** flag indicating that a column with a percentage value is displayed in the tooltip */
    withPercent?: boolean;
    /** flag indicating that a column with a diff is displayed in the tooltip */
    useCompareFrom?: boolean;
    /** flag indicating that the tooltip displays a block with information about the holiday */
    holiday?: boolean;
    /** name of the holiday */
    holidayText?: string;
    /** the region for which the holiday is relevant */
    region?: string;
    /** the sum of the values of the rows displayed in the tooltip */
    sum?: number | string;
    /** the number of hidden lines "not fit" in the tooltip */
    hiddenRowsNumber: number;
    /** the sum of the values of hidden ("not fit" in the tooltip) rows */
    hiddenRowsSum?: number | string;
    unsafe?: NonNullable<WidgetBase['config']>['unsafe'];
};

export type TooltipLine = {
    /** the color displayed in the corresponding cell */
    seriesColor: string;
    /** the name of the measurement displayed in the corresponding cell */
    seriesName: string;
    /** line index */
    seriesIdx?: number;
    /** flag indicating whether the line name should be displayed */
    hideSeriesName?: boolean;
    /** the percentage value displayed in the corresponding cell */
    percentValue?: number | string;
    /** the diff value displayed in the corresponding cell */
    diff?: string;
    /** formatted numeric value for the current measurement displayed in the corresponding cell */
    value: string;
    originalValue: number;
    /** Line comment (displayed under the corresponding line), set via manageTooltipConfig */
    commentText?: string;
    /** Comment to the line (displayed under the corresponding line), set via the comments dialog */
    xyCommentText?: string;
    /** flag indicating that this line is active */
    selectedSeries?: boolean;
    /** custom rendering of the corresponding line (a line with text or html markup) */
    customRender?: string;
    /**
     * an object where keys are indexes of cells whose content should be replaced,
     * values are functions that return a string (with text or html markup) that will be inserted into the cell at the corresponding index
     */
    replaceCellAt?: Record<number, (line: TooltipLine) => string>;
    /**
     * an object where keys are indexes on which new cells will be inserted (the cell previously located on this
     * index and the ones following it will be shifted), values are functions that return a string (with text or html markup) that will be inserted into the added cell
     */
    insertCellAt?: Record<number, (line: TooltipLine) => string>;
    /** the form displayed in the corresponding cell, instead of a block with a color */
    seriesShape?: LineShapeType;
    chartKitFormatting?: boolean;
    chartKitFormat?: FormatNumberOptions['format'];
    chartKitPostfix?: FormatNumberOptions['postfix'];
    chartKitPrecision?: FormatNumberOptions['precision'];
    chartKitPrefix?: FormatNumberOptions['prefix'];
    chartKitShowRankDelimiter?: FormatNumberOptions['showRankDelimiter'];
    chartKitUnit?: FormatNumberOptions['unit'];
};

export type RowRenderingConfig = {
    /** array of functions that return the content of cells in this row */
    cellsRenderers: Array<(line: TooltipLine) => string>;
    /** flag indicating that this is an active string */
    isSelectedLine?: boolean;
    /** flag indicating that comments are allowed for this line */
    allowComment?: boolean;
    /** flag indicating that this line has a dark background */
    withDarkBackground?: boolean;
    /** flag indicating that this line is the only one in the tooltip */
    isSingleLine?: boolean;
    /** index of the row in the tooltip */
    rowIndex?: number;
};
