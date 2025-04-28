import {Page} from '@playwright/test';

import {ChartkitMenuDialogsQA, ChartKitTableQa, ChartQa, MenuItemsQA} from '../../../src/shared';
import {slct, waitForCondition} from '../../utils';
import {readDownload} from '../../utils/playwright/utils';

export enum DOMNamedAttributes {
    StrokeDashArray = 'stroke-dasharray',
    Stroke = 'stroke',
}

export const CHARTKIT_MENU_ITEMS_SELECTORS = {
    menuCommentsQA: 'comments',
    menuShowCommentsQA: 'showComments',
    menuHideCommentsQA: 'hideComments',
    inspectorQA: 'inspector',
    shareQA: 'getLink',
    exportQA: 'export',
    alertsQA: 'alerts',
};

export default class ChartKit {
    geopointSelector = '.chartkit-yandex-map-chips';
    tooltipSelector = '.chartkit-tooltip';
    yMapSelector = '.chartkit-ymap';
    legendItemSelector = '.highcharts-legend-item';
    chartMenuSwitcher = slct('chart-dropdown-switcher');
    chartMenuList = slct('chart-dropdown-menu');
    commentsSelector = '.highcharts-comment';
    alertLimitSelector = '.highcharts-plot-band';
    xAxisLabel = '.highcharts-xaxis-labels text';
    chartTitle = '.highcharts-title';
    navigator = '.highcharts-navigator';
    metricItemSelector = ['.chartkit-indicator__item', slct(ChartQa.Chart)].join();
    metricItemValueSelector = '.chartkit-indicator__item-value,.markup-metric-value';
    metricItemTitleSelector = '.chartkit-indicator__item-title,.markup-metric-title';
    private drillArrowsSelector = '.chartkit-drill__drill-action';
    private breadcrumbsItemSelector = '.chartkit-drill .g-breadcrumbs__item';
    private breadcrumbsSwitcherSelector = '.chartkit-drill .g-breadcrumbs__switcher';
    private paginatorSelector = '.chartkit-table-paginator';
    private tableHeadCellSelector = '.data-table__head-cell';
    private layerLegendSelector = '.chartkit .chartkit-ymap-legend-layer';
    private labelsSelector = '.highcharts-data-labels .highcharts-data-label';
    private chartkitSeriesRect = '.chartkit-highcharts rect.highcharts-point';

    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async openChartMenu() {
        await this.page.hover(slct(ChartkitMenuDialogsQA.chartWidget));
        await this.page.waitForSelector(this.chartMenuSwitcher);
        await this.page.locator(this.chartMenuSwitcher).click();
    }

    async waitForItemInMenu(qaName: string) {
        await this.page.waitForSelector(`${this.chartMenuList} [data-qa="${qaName}"]`);
    }

    async openChartMenuAndClickItem(menuItemSelector: string) {
        await waitForCondition(async () => {
            await this.openChartMenu();

            try {
                await this.page.click(menuItemSelector, {timeout: 2000});
                return true;
            } catch {
                return false;
            }
        });
    }

    async clickMenuItem(qaSelector: string) {
        await this.page.waitForSelector(this.chartMenuSwitcher);
        await this.openChartMenu();
        await this.waitForItemInMenu(qaSelector);
        await this.page.click(`[data-qa="${qaSelector}"]`);
    }

    async getComments() {
        // while in the tests we take into account only comments-lines, for areas and so on, the logic may be different
        return await this.page.$$(`path${this.commentsSelector}`);
    }

    async getCommentByText(commentText: string) {
        return await this.page.$$(`text${this.commentsSelector} >> ${commentText}`);
    }

    async openScreenshotDialog() {
        await this.openExportMenuAndClickSubItem(slct(MenuItemsQA.EXPORT_SCREENSHOT));
    }

    async drillDown() {
        await this.page.waitForSelector(this.drillArrowsSelector);
        const [_leftArrow, rightArrow] = await this.page.$$(this.drillArrowsSelector);
        await rightArrow.click();
    }

    async drillUp() {
        await this.page.waitForSelector(this.drillArrowsSelector);
        const [leftArrow] = await this.page.$$(this.drillArrowsSelector);
        await leftArrow.click();
    }

    async waitForErrorTitle(errorQa: string) {
        await this.page.waitForSelector(slct(errorQa));
    }

    getTableLocator() {
        return this.page
            .locator('.chartkit-table')
            .or(this.page.locator(slct(ChartKitTableQa.Widget)));
    }

    async waitForSuccessfulRender() {
        const locator = this.page.locator('.chartkit-graph').or(this.getTableLocator());
        await locator.waitFor();
    }

    async openExportMenuAndClickSubItem(subItemSelector: string) {
        await this.openChartMenu();
        await this.page.hover(slct(MenuItemsQA.EXPORT));

        const subItem = await this.page.waitForSelector(subItemSelector);
        await subItem.click();
    }

    async openCsvExportDialog() {
        await this.openExportMenuAndClickSubItem(slct(MenuItemsQA.EXPORT_CSV));
        return this.page.waitForSelector(slct(ChartkitMenuDialogsQA.chartMenuExportCsvDialog));
    }

    async exportCsv(options?: {fractionDelimiter?: string}) {
        const downloadPromise = this.page.waitForEvent('download');

        const dialog = await this.openCsvExportDialog();

        if (options?.fractionDelimiter) {
            const selectFloatSelector = await dialog.waitForSelector(
                slct(ChartkitMenuDialogsQA.chartMenuExportCsvSelectFloat),
            );
            await selectFloatSelector.click();
            await this.page.locator(slct(options.fractionDelimiter)).click();
        }

        await this.page.click(slct(ChartkitMenuDialogsQA.chartMenuExportModalApplyBtn));

        const download = await downloadPromise;
        const content = await readDownload(download);
        await download.delete();

        return content?.toString('utf8');
    }

    async exportMarkdown() {
        await this.openExportMenuAndClickSubItem(slct(MenuItemsQA.EXPORT_MARKDOWN));

        return await this.page.evaluate(async () => {
            return await navigator.clipboard.readText();
        });
    }

    async openInNewTab() {
        const newTabPagePromise: Promise<Page> = new Promise((resolve) =>
            this.page.context().on('page', resolve),
        );
        const selector = slct(MenuItemsQA.NEW_WINDOW);
        await this.openChartMenuAndClickItem(selector);

        return newTabPagePromise;
    }

    async saveAsPicture() {
        const newTabPagePromise: Promise<Page> = new Promise((resolve) =>
            this.page.context().on('page', resolve),
        );
        await this.openScreenshotDialog();

        await this.page.click(slct('download-screenshot-modal-download-btn'));

        return newTabPagePromise;
    }

    async waitForPaginationExist() {
        await this.page.waitForSelector(this.paginatorSelector);
    }

    async waitForPaginationNotExist() {
        await this.page.waitForSelector(this.paginatorSelector, {state: 'detached'});
    }

    async getBreadcrumbs() {
        const switchers = await this.page.$$(this.breadcrumbsSwitcherSelector);
        const items = await this.page.$$(this.breadcrumbsItemSelector);
        const switchersText = await Promise.all(switchers.map((el) => el.innerText()));
        const itemsText = await Promise.all(items.map((el) => el.innerText()));

        return [...switchersText, ...itemsText];
    }

    async getTableRowsCount() {
        return await this.getTableLocator().locator('tbody tr').count();
    }

    getLayerLegend() {
        return this.page.$(this.layerLegendSelector);
    }

    async getHeadRowsHtml() {
        const headerRows = this.getTableLocator().locator('thead').first().locator('tr');
        const headCellContent = this.page
            .locator(this.tableHeadCellSelector)
            .or(this.page.locator(slct(ChartKitTableQa.HeadCellContent)));
        await headerRows.first().waitFor();

        const rows = await headerRows.all();
        return await Promise.all(
            rows.map(async (row) =>
                Promise.all(
                    (await row.locator(headCellContent).all()).map((cell) => cell.innerHTML()),
                ),
            ),
        );
    }

    async getHeadRowsTexts() {
        const headerRows = this.getTableLocator().locator('thead').first().locator('tr');
        await headerRows.first().waitFor();

        const rows = await headerRows.all();
        return await Promise.all(rows.map((row) => row.locator('th').allTextContents()));
    }

    async getRowsTexts() {
        const rowLocator = this.getTableLocator().locator('tbody tr');
        await rowLocator.first().waitFor();

        const rows = await rowLocator.all();
        const content = await Promise.all(rows.map((row) => row.locator('td').allTextContents()));

        return content.map((row) => {
            return row.map((rowValue) => rowValue.replace(/\u00a0/g, ' '));
        });
    }

    async waitUntilLoaderExists() {
        await waitForCondition(async () => {
            return !(await this.page.$('.chartkit-loader.chartkit-loader_veil'));
        }).catch(() => {
            throw new Error("Loader didn't disappear");
        });
    }

    async getAttributeFromLines(attributeName: DOMNamedAttributes) {
        let lines: string[] = [];
        await waitForCondition(async () => {
            lines = await this.page.evaluate(
                ({attribute}: {attribute: DOMNamedAttributes}) => {
                    const lineNodes = document.querySelectorAll(
                        '.highcharts-series .highcharts-graph',
                    );
                    return Array.from(lineNodes)
                        .map((lineEl) => lineEl.attributes.getNamedItem(attribute)?.value)
                        .filter(Boolean) as string[];
                },
                {attribute: attributeName} as {attribute: DOMNamedAttributes},
            );
            return lines.length;
        });
        return lines;
    }

    async navigateToNextTablePage(times: number) {
        for (let i = 0; i < times; i++) {
            await this.page.click(slct('chartkit-table-paginator-next-btn'));
        }
    }

    async getSeriesClientRect() {
        const locator = this.page.locator(this.chartkitSeriesRect);
        return await locator.evaluateAll((elements) =>
            elements.map((el) => el.getBoundingClientRect()),
        );
    }

    async getLabelsClientRect() {
        const locator = this.page.locator(this.labelsSelector);
        return await locator.evaluateAll((elements) =>
            elements.map((el) => el.getBoundingClientRect()),
        );
    }

    async getLabelsTexts() {
        await this.page.waitForSelector(this.labelsSelector);

        const locator = this.page.locator(this.labelsSelector);

        await locator.first().waitFor();
        const labels = await locator.allTextContents();

        return labels.map((rowValue) => rowValue.replace(/\u00a0/g, ' '));
    }
}
