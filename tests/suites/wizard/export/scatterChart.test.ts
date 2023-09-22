import {expect, Page} from '@playwright/test';
import {WizardVisualizationId} from '../../../page-objects/common/Visualization';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {openTestPage} from '../../../utils';

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

        const apiRunRequest = wizardPage.page.waitForRequest(
            (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
        );
        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Size, 'Year');
        await (await apiRunRequest).response();

        const clipboardData = await wizardPage.chartkit.exportMarkdown();
        const expected = `|Region|Profit|Sales|Year|
|:-|:-:|:-:|-:|
|Central|7205|147100.90003708005|2017|
|South|8622|122908.89981234074|2017|
|South|17531|93611.90013027191|2016|
|Central|19626|147431.2006058097|2016|
|East|19795|180689.10041177273|2016|
|West|23708|187483.29958748817|2016|
|East|32839|213086.00086772442|2017|
|West|43327|250135.10026693344|2017|`;

        await expect(clipboardData).toEqual(expected);
    });

    datalensTest('Points with size and color. Markdown', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Size, 'Year');
        const apiRunRequest = wizardPage.page.waitForRequest(
            (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
        );
        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'Profit AVG');
        await (await apiRunRequest).response();

        const clipboardData = await wizardPage.chartkit.exportMarkdown();
        const expected = `|Region|Profit|Sales|Year|Profit AVG|
|:-|:-:|:-:|:-:|-:|
|Central|7205|147100.90003708005|2017|9.260925449871465|
|South|8622|122908.89981234074|2017|16.644787644787645|
|South|17531|93611.90013027191|2016|42.44794188861985|
|Central|19626|147431.2006058097|2016|32.54726368159204|
|East|19795|180689.10041177273|2016|25.842036553524803|
|West|23708|187483.29958748817|2016|29.450931677018634|
|East|32839|213086.00086772442|2017|35.65580890336591|
|West|43327|250135.10026693344|2017|39.56803652968036|`;

        await expect(clipboardData).toEqual(expected);
    });
});
