import React from 'react';

import type {AxisPlotBand, AxisPlotLine, ChartTooltip} from '@gravity-ui/chartkit/gravity-charts';
import {ChartTooltipContent} from '@gravity-ui/chartkit/gravity-charts';
import block from 'bem-cn-lite';
import type {LineShapeType} from 'shared';
import {getShapedLineIcon} from 'ui/utils/line-shapes';

import './TooltipWithComments.scss';

const b = block('chartkit-dl-tooltip-with-comments');
const COMMENTS_SECTION_LEFT_PADDING = 10;
const PLOT_LINE_INDICATOR_HEIGHT = 3;

type TooltipRenderer = NonNullable<ChartTooltip['renderer']>;

export function TooltipWithComments({
    data,
    plotBands,
    plotLines,
    qa,
    rowRenderer,
    valueFormat,
    totals,
}: {
    data: Parameters<TooltipRenderer>[0];
    plotBands: AxisPlotBand[];
    plotLines: AxisPlotLine[];
    qa?: string;
    rowRenderer?: ChartTooltip['rowRenderer'];
    valueFormat?: ChartTooltip['valueFormat'];
    totals?: ChartTooltip['totals'];
}) {
    const {headerFormat, hovered, xAxis, yAxis} = data;
    const [commentsSectionRef, setCommentsSectionRef] = React.useState<HTMLDivElement | null>(null);
    const commentsSectionWidth = commentsSectionRef?.offsetWidth ?? 0;
    const plotLineIndicatorWidth =
        commentsSectionWidth > 0 ? commentsSectionWidth - COMMENTS_SECTION_LEFT_PADDING : 0;

    return (
        <div className={b()}>
            <ChartTooltipContent
                hovered={hovered}
                rowRenderer={rowRenderer}
                headerFormat={headerFormat}
                valueFormat={valueFormat}
                totals={totals}
                xAxis={xAxis}
                yAxis={yAxis}
                qa={qa}
            />
            <div className={b('comments-section')} ref={setCommentsSectionRef}>
                {plotBands.map((band, i) => (
                    <div key={`tooltip-plot-band-${i}`} className={b('plot-item')}>
                        <div
                            className={b('plot-band-indicator')}
                            style={{backgroundColor: band.color}}
                        />
                        <span className={b('plot-text')}>{band.custom?.text}</span>
                    </div>
                ))}
                {plotLines.map((line, i) => (
                    <div key={`tooltip-plot-line-${i}`} className={b('plot-item')}>
                        <div className={b('plot-line-indicator')} style={{color: line.color}}>
                            {getShapedLineIcon({
                                height: PLOT_LINE_INDICATOR_HEIGHT,
                                shape: (line.dashStyle || 'Solid') as LineShapeType,
                                width: plotLineIndicatorWidth,
                            })}
                        </div>
                        <span className={b('plot-text')}>{line.custom?.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
