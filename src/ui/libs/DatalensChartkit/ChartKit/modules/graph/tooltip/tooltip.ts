/* eslint-disable complexity */

import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import {escape, orderBy} from 'lodash';

import {renderTooltipIcon} from '../../../components/IconRenderer/renderTooltipIcon';
import {i18n} from '../../i18n/i18n';

import {escapeHTML} from './helpers';
import type {RowRenderingConfig, TooltipData, TooltipLine} from './types';

import './tooltip.scss';

export const SERIES_NAME_DATA_ATTRIBUTE = 'data-series-name';
export const SERIES_IDX_DATA_ATTRIBUTE = 'data-series-idx';
export const TOOLTIP_CONTAINER_CLASS_NAME = '_tooltip';
export const TOOLTIP_ROW_NAME_CLASS_NAME = '_tooltip-rows__name-td';
export const TOOLTIP_ROW_CLASS_NAME = '_tooltip-row';
export const TOOLTIP_HEADER_CLASS_NAME = '_tooltip-header';
export const TOOLTIP_LIST_CLASS_NAME = '_tooltip-list';
export const TOOLTIP_FOOTER_CLASS_NAME = '_tooltip-footer';

const renderEmptyCell = () => '<td />';

const renderColorCell = (line: TooltipLine) =>
    `<td class="_tooltip-rows__bubble-td">
        <div class="_tooltip-rows__bubble-div" style="background-color:${line.seriesColor};"></div>
    </td>`;

const renderLineShapeCell = (line: TooltipLine) =>
    `<td class="_tooltip-rows__shape-td">
        <div class="_tooltip-rows__shape-div"
            style="color:${line.seriesColor};">
           ${renderTooltipIcon({type: line.seriesShape})}
        </div>
    </td>`;

const renderNameCell = (line: TooltipLine) =>
    `<td class="${TOOLTIP_ROW_NAME_CLASS_NAME}">
        ${line.hideSeriesName ? '' : escapeHTML(line.seriesName)}
    </td>`;

const renderPercentCell = (line: TooltipLine) =>
    `<td class="_tooltip-rows__percent-td">
        ${line.percentValue ? line.percentValue + '%' : ''}
    </td>`;

const renderValueCell = (line: TooltipLine) =>
    `<td class="_tooltip-rows__value-td">
        ${line.value}
    </td>`;

const renderDiffCell = (line: TooltipLine) =>
    `<td class="_tooltip-rows__diff-td">
        ${line.diff ? ` (${line.diff})` : ''}
    </td>`;

function renderAdditionalSection(data: TooltipData, splitTooltip = false, colspanNumber = 1) {
    return `<td class="_tooltip-right__td ${
        splitTooltip ? '_tooltip-right__td_with-split-tooltip' : ''
    }" colspan="${colspanNumber || 1}">
             ${
                 data.holiday
                     ? `<div class="_tooltip-right__holiday-div">
                    <div class="_tooltip-right__holiday-emoji">🎈</div>
                    <div>
                        ${data.holidayText}
                        ${
                            data.region
                                ? `<span class="_tooltip-right__holiday-region">[${data.region}]</span>`
                                : ''
                        }
                    </div>
                </div>`
                     : ''
             }

            ${
                data.commentDateText
                    ? `<div class="${data.xComments ? '_tooltip-right__margin-bot' : ''}">${
                          data.commentDateText
                      }</div>`
                    : ''
            }

            ${
                data.xComments
                    ? data.xComments
                          .map(
                              (comment) =>
                                  `<div class="_tooltip-right__traf-div ${
                                      splitTooltip
                                          ? '_tooltip-right__traf-div_for-split-tooltip'
                                          : ''
                                  }" style="border-color: ${comment.color};">${comment.text}</div>`,
                          )
                          .join('')
                    : ''
            }
        </td>`;
}

const renderRow = (
    line: TooltipLine,
    {
        isSelectedLine,
        cellsRenderers,
        isSingleLine,
        allowComment,
        withDarkBackground,
        rowIndex,
    }: RowRenderingConfig,
) => {
    const hasComment = line.commentText || line.xyCommentText;
    const needRenderComment = allowComment && hasComment;
    const fullCellsRenderers = cellsRenderers.slice();

    const rowKey = `${String(rowIndex) || ''}-${String(escapeHTML(line.seriesName))
        .slice(0, 20)
        .replace(/(\r\n|\n|\r)/gm, '')}`;

    if (line.insertCellAt) {
        (Object.keys(line.insertCellAt) || []).forEach((index) => {
            fullCellsRenderers.splice(Number(index), 0, renderEmptyCell);
        });
    }

    if (line.customRender) {
        return `<tr class="${TOOLTIP_ROW_CLASS_NAME}${
            isSelectedLine ? ' _tooltip-selected-row' : ''
        }${isSingleLine ? ' _tooltip-uniq-row' : ''}${
            withDarkBackground ? ' _tooltip-row-dark-bg' : ''
        }" ${SERIES_NAME_DATA_ATTRIBUTE}="${rowKey}" ${
            line.seriesIdx ? `${SERIES_IDX_DATA_ATTRIBUTE}="${line.seriesIdx}"` : ''
        }>
            ${
                line.customRender.trim().indexOf('<td') === 0
                    ? line.customRender
                    : `<td colspan="${cellsRenderers.length}">${line.customRender}</td>`
            }
        </tr>
        ${
            needRenderComment
                ? `<tr class="_tooltip-comment-row${
                      isSelectedLine ? ' _tooltip-selected-row' : ''
                  }${withDarkBackground ? ' _tooltip-row-dark-bg' : ''}">
                    <td>
                        ${
                            line.commentText
                                ? `<div class="_tooltip-rows__comment-div">${line.commentText}</div>`
                                : ''
                        }
                        ${
                            line.xyCommentText
                                ? `<div class="_tooltip-rows__comment-div">${line.xyCommentText}</div>`
                                : ''
                        }
                    </td>
                </tr>`
                : ''
        }`;
    }

    // the withDarkBackground flag is responsible for setting the _tooltip-row-dark-bg class that adds a dark background to the corresponding tr
    // solving this problem via css (nth-child) is not possible, since the comment added as a separate tr
    // must be with the same background as the corresponding data row
    return `<tr class="${TOOLTIP_ROW_CLASS_NAME}${isSelectedLine ? ' _tooltip-selected-row' : ''}${
        isSingleLine ? ' _tooltip-uniq-row' : ''
    }${
        withDarkBackground ? ' _tooltip-row-dark-bg' : ''
    }" ${SERIES_NAME_DATA_ATTRIBUTE}="${rowKey}" ${
        line.seriesIdx ? `${SERIES_IDX_DATA_ATTRIBUTE}="${line.seriesIdx}"` : ''
    }>
            ${fullCellsRenderers
                .map((render, index) => {
                    if (line.replaceCellAt && line.replaceCellAt[index]) {
                        return typeof line.replaceCellAt[index] === 'string'
                            ? line.replaceCellAt[index]
                            : line.replaceCellAt[index](line);
                    } else if (line.insertCellAt && line.insertCellAt[index]) {
                        return typeof line.insertCellAt[index] === 'string'
                            ? line.insertCellAt[index]
                            : line.insertCellAt[index](line);
                    } else {
                        return render(line);
                    }
                })
                .join('')}
        </tr>

        ${
            needRenderComment
                ? `<tr class="_tooltip-comment-row${
                      isSelectedLine ? ' _tooltip-selected-row' : ''
                  }${withDarkBackground ? ' _tooltip-row-dark-bg' : ''}">
                    <td colspan="4">
                        ${
                            line.commentText
                                ? `<div class="_tooltip-rows__comment-div">${line.commentText}</div>`
                                : ''
                        }
                        ${
                            line.xyCommentText
                                ? `<div class="_tooltip-rows__comment-div">${line.xyCommentText}</div>`
                                : ''
                        }
                    </td>
                </tr>`
                : ''
        }`;
};

export function formatTooltip(data: TooltipData, tooltip: Highcharts.Tooltip, isMobile?: boolean) {
    const {splitTooltip, activeRowAlwaysFirstInTooltip} = data;
    const selectedLineIndex = data.lines.findIndex(({selectedSeries}) => selectedSeries);
    const selectedLine = data.lines[selectedLineIndex];
    const lines = data.lines.slice(0, (tooltip.lastVisibleRowIndex || data.lines.length) + 1);
    const sortedLines = orderBy(lines, ['originalValue'], ['desc']);
    const withShapes = lines.every((line) => line.seriesShape);
    const unsafe = data.unsafe;
    const tooltipHeaderRaw = data.tooltipHeader?.trim();
    const tooltipHeaderEscaped = escapeHTML(tooltipHeaderRaw);
    const cellsRenderers = [];

    if (withShapes) {
        cellsRenderers.push(renderLineShapeCell);
    } else {
        cellsRenderers.push(renderColorCell);
    }

    if (data.shared) {
        cellsRenderers.push(renderNameCell);
    }

    if (data.withPercent) {
        cellsRenderers.push(renderPercentCell);
    }

    cellsRenderers.push(renderValueCell);

    if (data.useCompareFrom) {
        cellsRenderers.push(renderDiffCell);
    }

    const rowRenderingConfig = {
        isSingleLine: lines.length === 1,
        cellsRenderers,
    };

    const rowRenderingConfigForSelectedLine = {
        cellsRenderers,
        useCompareFrom: data.useCompareFrom,
        isSelectedLine: true,
        allowComment: selectedLineIndex > tooltip.lastVisibleRowIndex,
    };

    // @ts-ignore
    // otherwise the linter in TeamCity will show an error,
    // looks like  the version of the typescript in TeamCity
    // doesn't know about the visualViewport experimental feature
    const windowHeight =
        document.body.clientHeight / ((window.visualViewport && window.visualViewport.scale) || 1);

    const tooltipMaxHeight =
        isMobile && window.innerHeight > window.innerWidth
            ? windowHeight - tooltip.chart?.plotSizeY ||
              tooltip.yagrChart?.height ||
              windowHeight / 2
            : windowHeight - (tooltip.options.padding || 0) * 4;

    function getRowRenderConfig(index: number) {
        return {
            ...rowRenderingConfig,
            rowIndex: index,
            isSelectedLine: lines.length > 1 && index === selectedLineIndex,
            withDarkBackground: lines.length > 2 && Boolean(index % 2),
            allowComment:
                index !== selectedLineIndex || !rowRenderingConfigForSelectedLine.allowComment,
        };
    }

    let tooltipContainerClassNames = TOOLTIP_CONTAINER_CLASS_NAME;

    if (splitTooltip) {
        tooltipContainerClassNames += ` ${TOOLTIP_CONTAINER_CLASS_NAME}_split-tooltip`;
    }

    return `
<div class="${tooltipContainerClassNames}" style="${
        tooltip.preFixationHeight ? `height: ${tooltip.preFixationHeight}px; ` : ''
    }max-height: ${splitTooltip ? 'auto' : `${tooltipMaxHeight}px`}">
    ${
        tooltipHeaderRaw
            ? // even the encoded markup breaks the layout, so do not define the title in unsafe mode
              `<div title="${unsafe ? '' : escape(tooltipHeaderEscaped)}" class="_tooltip-date">
                ${unsafe ? tooltipHeaderRaw : tooltipHeaderEscaped}
            </div>`
            : ''
    }
    ${
        splitTooltip &&
        (data.holiday || data.commentDateText || (data.xComments && data.xComments.length))
            ? `<table border="0" cellpadding="0" cellspacing="0">
                <tbody>
                    <tr>
                        ${renderAdditionalSection(data, true, cellsRenderers.length)}
                    </tr>
                </tbody>
            </table>`
            : ''
    }
    <table border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td class="_tooltip-left__td">
                <table class="_tooltip-rows__table">
                    ${
                        splitTooltip
                            ? ''
                            : `<thead class=${TOOLTIP_HEADER_CLASS_NAME}>
                                ${
                                    selectedLine &&
                                    (activeRowAlwaysFirstInTooltip ||
                                        (tooltip.lastVisibleRowIndex &&
                                            selectedLineIndex > tooltip.lastVisibleRowIndex))
                                        ? renderRow(selectedLine, rowRenderingConfigForSelectedLine)
                                        : ''
                                }
                                <tr class="_tooltip-fake-row">${Array(cellsRenderers.length)
                                    .fill('<td></td>')
                                    .join('')}</tr>
                            </thead>`
                    }
                    <tbody class="${TOOLTIP_LIST_CLASS_NAME}">
                        ${sortedLines
                            .map((line, index) => renderRow(line, getRowRenderConfig(index)))
                            .join('')}
                    </tbody>
                    ${
                        splitTooltip
                            ? ''
                            : `<tbody class="${TOOLTIP_FOOTER_CLASS_NAME}">
                                ${
                                    tooltip.lastVisibleRowIndex && data.hiddenRowsNumber > 0
                                        ? `<tr class="${TOOLTIP_ROW_CLASS_NAME} _hidden-rows-sum${
                                              lines.length % 2 ? ' _hidden-rows-sum-dark-bg' : ''
                                          }">
                                            <td colspan="${
                                                cellsRenderers.length - 1
                                            }" class="_hidden-rows-number">
                                                ${i18n('chartkit', 'tooltip-rest')} ${
                                                    data.hiddenRowsNumber
                                                }
                                            </td>
                                            <td class="_hidden-rows-value">${
                                                data.hiddenRowsSum
                                            }</td>
                                        </tr>`
                                        : ''
                                }
                                <tr class="_tooltip-fake-row">${Array(cellsRenderers.length)
                                    .fill('<td></td>')
                                    .join('')}</tr>
                                ${
                                    data.sum
                                        ? `<tr class="_tooltip-rows__summ-tr">
                                            <td class="_tooltip-rows__summ-td" colspan="${
                                                cellsRenderers.length - 1
                                            }">${i18n('chartkit', 'tooltip-sum')}</td>
                                            <td class="_tooltip-rows__summ-td _tooltip-rows__summ-td-value">
                                                ${data.sum}
                                            </td>
                                        </tr>`
                                        : ''
                                }
                            </tbody>`
                    }
                </table>
            </td>

            ${
                !splitTooltip &&
                (data.holiday || data.commentDateText || (data.xComments && data.xComments.length))
                    ? renderAdditionalSection(data)
                    : ''
            }
        </tr>
    </table>
</div>`;
}

export default formatTooltip;
