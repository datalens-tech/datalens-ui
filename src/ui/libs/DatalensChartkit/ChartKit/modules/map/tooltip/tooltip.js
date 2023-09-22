/* eslint-disable indent, max-len */

import './tooltip.scss';

function formatTooltip(data, isSplitTooltip) {
    return `
<div class="chart-tooltip${isSplitTooltip ? ' chart-tooltip_split-tooltip' : ''}">
    ${data.header ? `<div class="chart-tooltip__header">${data.header}</div>` : ''}
    ${data.datetime ? `<div class="chart-tooltip__region">${data.name_local}</div>` : ''}
    <table class="chart-tooltip__point-series">
        <tbody>
            ${data.tooltipValues
                .map(
                    (value) =>
                        `<tr>
                    <td class="chart-tooltip__bubble-cell" ${
                        value.colorBubble ? `style="background-color: ${data.color};"` : ''
                    }>
                    </td>
                    <td class="chart-tooltip__value-cell">
                        ${value.formatted}
                    </td>
                    <td class="chart-tooltip__series-cell">
                        <span class="chart-tooltip__series">
                            ${value.title}
                        </span>
                    </td>
                </tr>`,
                )
                .join('')}
        </tbody>
    </table>
</div>`;
}

export default formatTooltip;
