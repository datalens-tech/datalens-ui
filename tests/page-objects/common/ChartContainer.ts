import {Page} from '@playwright/test';
import {COMMON_CHARTKIT_SELECTORS} from '../constants/chartkit';

export class ChartContainer {
    private page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    async getSeriesColors(navigator: boolean) {
        return await this.page.evaluate(
            ({isNavigator}: {isNavigator: boolean}) => {
                const highchartsSeriesSelector = isNavigator
                    ? '.highcharts-navigator-series'
                    : '.highcharts-line-series:not(.highcharts-navigator-series)';
                let navigatorSeries = document.querySelectorAll(
                    `.highcharts-series-group .highcharts-series${highchartsSeriesSelector} .highcharts-graph`,
                );

                if (!navigatorSeries.length) {
                    const gChartsSeriesSelector = isNavigator
                        ? '.gcharts-range-slider .gcharts-line'
                        : '.gcharts-chart__content .gcharts-line';
                    navigatorSeries = document.querySelectorAll(`${gChartsSeriesSelector} path`);
                }

                return Array.from(navigatorSeries).map((el) => {
                    const attributesList = el.attributes;
                    const attributeItem = attributesList.getNamedItem('stroke');

                    return (
                        attributeItem?.value ||
                        attributeItem?.nodeValue ||
                        attributeItem?.textContent ||
                        ''
                    );
                });
            },
            {isNavigator: navigator},
        );
    }

    async getLegendItems() {
        const legendItems = this.page.locator(COMMON_CHARTKIT_SELECTORS.chartLegendItem);

        return await legendItems.evaluateAll((elements) =>
            elements.map((element) => {
                const lineEl =
                    element.getElementsByClassName('highcharts-graph')[0] ||
                    element.getElementsByClassName('gcharts-legend__item-symbol')[0];
                return {
                    legendTitle: element.textContent,
                    color: lineEl.getAttribute('stroke'),
                    shape: lineEl.getAttribute('stroke-dasharray'),
                };
            }),
        );
    }
}
