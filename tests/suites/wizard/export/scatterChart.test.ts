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
        const expected = `|Region|Profit|Sales|
|:-|:-:|-:|
|South|26153|216520.79994261265|
|Central|26831|294532.10064288974|
|East|52634|393775.10127949715|
|West|67035|437618.3998544216|`;

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
        const expected = `|Region|Profit|Sales|Year|
|:-|:-:|-:|
|South|26153|216520.79994261265|2017|
|Central|26831|294532.10064288974|2017|
|East|52634|393775.10127949715|2017|
|West|67035|437618.3998544216|2017|`;

        await expect(clipboardData).toEqual(expected);
    });

    datalensTest('Points with size and color. Markdown', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Size, 'Year');
        await wizardPage.visualizationItemDialog.open(PlaceholderName.Size, 'Year');
        await wizardPage.visualizationItemDialog.setAggregation(
            DialogFieldAggregationSelectorValuesQa.Max,
        );
        await wizardPage.visualizationItemDialog.clickOnApplyButton();

        const apiRunRequest = wizardPage.page.waitForRequest(
            (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
        );
        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'Profit AVG');
        await (await apiRunRequest).response();

        const clipboardData = await wizardPage.chartkit.exportMarkdown();
        const expected = `|Region|Profit|Sales|Year|Profit AVG|
|:-|:-:|:-:|:-:|-:|
|South|26153|216520.79994261265|1877414|28.091299677765843|
|Central|26831|294532.10064288974|2784874|19.428674873280233|
|East|52634|393775.10127949715|3401913|31.19976289270895|
|West|67035|437618.3998544216|3831495|35.28157894736842|`;

        await expect(clipboardData).toEqual(expected);
    });
});
