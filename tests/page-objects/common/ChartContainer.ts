import {Page} from '@playwright/test';

export class ChartContainer {
    private page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    async getSeriesColors(navigator: boolean) {
        return await this.page.evaluate(
            ({isNavigator}: {isNavigator: boolean}) => {
                const selector = isNavigator
                    ? '.highcharts-navigator-series'
                    : '.highcharts-line-series:not(.highcharts-navigator-series)';
                const navigatorSeries = document.querySelectorAll(
                    `.highcharts-series-group .highcharts-series${selector} .highcharts-graph`,
                );

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
        const legendItems = this.page.locator('.highcharts-legend-item');

        return await legendItems.evaluateAll((elements) =>
            elements.map((element) => {
                const lineEl = element.getElementsByClassName('highcharts-graph')[0];
                return {
                    legendTitle: element.textContent,
                    color: lineEl.getAttribute('stroke'),
                    shape: lineEl.getAttribute('stroke-dasharray'),
                };
            }),
        );
    }
}
