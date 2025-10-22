import {expect, Page} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {openTestPage} from '../../../utils';
import {
    WizardVisualizationId,
    DialogFieldAggregationSelectorValuesQa,
} from '../../../../src/shared';

datalensTest.describe('Wizard - export. Scatter plot', () => {
    datalensTest.beforeEach(async ({page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Scatter);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Profit');
        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

        let apiRunRequest = wizardPage.page.waitForRequest(
            (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
        );
        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Points, 'Region');
        await (await apiRunRequest).response();

        apiRunRequest = wizardPage.page.waitForRequest(
            (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
        );
        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'Year');
        await wizardPage.filterEditor.selectValues(['2016', '2017']);
        await wizardPage.filterEditor.apply();
        await (await apiRunRequest).response();

        await wizardPage.page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
    });

    datalensTest('Points only. Markdown', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        const clipboardData = await wizardPage.chartkit.exportMarkdown();
        const expected = `|Profit|Sales|Region|
|:-|:-:|-:|
|52634|393775.10127949715|East|
|67035|437618.3998544216|West|
|26153|216520.79994261265|South|
|26831|294532.10064288974|Central|`;

        await expect(clipboardData).toEqual(expected);
    });

    datalensTest('Points size. Markdown', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Size, 'Year');
        await wizardPage.visualizationItemDialog.open(PlaceholderName.Size, 'Year');
        await wizardPage.visualizationItemDialog.setAggregation(
            DialogFieldAggregationSelectorValuesQa.Max,
        );
        const apiRunRequest = wizardPage.page.waitForRequest(
            (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
        );
        await wizardPage.visualizationItemDialog.clickOnApplyButton();
        await (await apiRunRequest).response();

        const clipboardData = await wizardPage.chartkit.exportMarkdown();
        const expected = `|Profit|Sales|Region|Year|
|:-|:-:|:-:|-:|
|52634|393775.10127949715|East|2017|
|67035|437618.3998544216|West|2017|
|26153|216520.79994261265|South|2017|
|26831|294532.10064288974|Central|2017|`;

        await expect(clipboardData).toEqual(expected);
    });

    datalensTest('Points with size and color. Markdown', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        let apiRunRequest = wizardPage.page.waitForRequest(
            (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
        );
        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Size, 'Year');
        await (await apiRunRequest).response();

        await wizardPage.visualizationItemDialog.open(PlaceholderName.Size, 'Year');
        await wizardPage.visualizationItemDialog.setAggregation(
            DialogFieldAggregationSelectorValuesQa.Max,
        );
        apiRunRequest = wizardPage.page.waitForRequest(
            (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
        );
        await wizardPage.visualizationItemDialog.clickOnApplyButton();
        await (await apiRunRequest).response();

        apiRunRequest = wizardPage.page.waitForRequest(
            (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
        );
        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'Profit AVG');
        await (await apiRunRequest).response();

        const clipboardData = await wizardPage.chartkit.exportMarkdown();
        const expected = `|Profit|Sales|Region|Year|Profit AVG|
|:-|:-:|:-:|:-:|-:|
|52634|393775.10127949715|East|2017|31.19976289270895|
|67035|437618.3998544216|West|2017|35.28157894736842|
|26153|216520.79994261265|South|2017|28.091299677765843|
|26831|294532.10064288974|Central|2017|19.428674873280233|`;

        await expect(clipboardData).toEqual(expected);
    });
});
