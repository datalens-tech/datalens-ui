import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {RadioButtons, RadioButtonsValues} from '../../../page-objects/wizard/PlaceholderDialog';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsDatasets, RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';
import {PlaceholderId} from '../../../../src/shared';

const expectedLabelsTexts = [
    '01.01.1998',
    '01.06.1998',
    '01.11.1998',
    '01.04.1999',
    '01.09.1999',
    '01.02.2000',
    '01.07.2000',
    '01.12.2000',
    '01.05.2001',
    '01.10.2001',
    '01.03.2002',
    '01.08.2002',
    '01.01.2003',
    '01.06.2003',
    '01.11.2003',
    '01.04.2004',
    '01.09.2004',
    '01.02.2005',
    '01.07.2005',
    '01.12.2005',
    '01.05.2006',
    '01.10.2006',
    '01.03.2007',
    '01.08.2007',
    '01.01.2008',
    '01.06.2008',
    '01.11.2008',
    '01.04.2009',
    '01.09.2009',
    '01.02.2010',
    '01.07.2010',
    '01.12.2010',
    '01.05.2011',
    '01.10.2011',
    '01.03.2012',
    '01.08.2012',
    '01.01.2013',
    '01.06.2013',
    '01.11.2013',
    '01.04.2014',
    '01.09.2014',
    '01.02.2015',
    '01.07.2015',
    '01.12.2015',
    '01.05.2016',
    '01.10.2016',
    '01.03.2017',
    '01.08.2017',
    '01.01.2018',
    '01.06.2018',
    '01.11.2018',
    '01.04.2019',
    '01.09.2019',
    '01.02.2020',
    '01.07.2020',
    '01.12.2020',
    '01.05.2021',
    '01.10.2021',
    '01.03.2022',
    '01.08.2022',
    '01.01.2023',
    '01.06.2023',
    '01.11.2023',
];

// todo: remove along with GravityChartsForLineAreaAndBarX feature flag
datalensTest.describe('Multi-faceted charts with layers', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsWizardUrls.Empty);
    });

    datalensTest.skip(
        'The data on the X-axis must be formed correctly from two datasets',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.addFirstDataset(RobotChartsDatasets.OrderSalesDataset);

            await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);

            const successfulResponsePromise = wizardPage.waitForSuccessfulResponse(
                CommonUrls.ApiRun,
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Date');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            await wizardPage.placeholderDialog.open(PlaceholderId.X);
            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AxisMode,
                RadioButtonsValues.Discrete,
            );
            await wizardPage.placeholderDialog.apply();

            await successfulResponsePromise;

            await wizardPage.addAdditionalDataset(RobotChartsDatasets.BirthClientsDataset);

            await wizardPage.sectionVisualization.addLayer();

            await wizardPage.datasetSelector.click();

            await wizardPage.datasetSelector.clickToSelectDatasetItemWithText(
                RobotChartsDatasets.BirthClientsDataset,
            );

            await wizardPage.datasetSelector.waitForSelectedValue(
                RobotChartsDatasets.BirthClientsDataset,
            );

            const successfulResponsePromise2 = wizardPage.waitForSuccessfulResponse(
                CommonUrls.ApiRun,
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y2, 'Clients');

            await successfulResponsePromise2;

            await page.waitForSelector(wizardPage.chartkit.xAxisLabel);
            const xAxisLabels = await page
                .locator(wizardPage.chartkit.xAxisLabel)
                .allTextContents();

            expect(xAxisLabels.join(',')).toEqual(expectedLabelsTexts.join(','));
        },
    );
});
