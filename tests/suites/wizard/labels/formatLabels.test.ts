import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {
    DialogFieldLabelModeValuesQa,
    DialogFieldMainSectionQa,
} from '../../../../src/shared/constants';

const EXPECTED_INITIAL_LABELS = ['742 009,40', '719 057,20', '836 174,90'];
const EXPECTED_FORMATTED_LABELS = ['742 009,4021', '719 057,2004', '836 174,8998'];
const EXPECTED_LABELS_WITH_LABEL_MODE_PERCENT = ['51%', '42%', '6%'];

async function getChartLabelValues(page: Page, expectedLength: number) {
    let values: string[] = [];

    await waitForCondition(async () => {
        values = await page.evaluate(() => {
            const lineLabelsSelector = '.highcharts-series-0.highcharts-data-labels';
            const labelsSelector = '.highcharts-data-label';
            const hcDataLabelsSelector = `${lineLabelsSelector} ${labelsSelector}`;
            // ToDo: replace with qa attribute
            const gravityChartsDataLabelsSelector = '.gcharts-pie__label tspan';

            const labels = document.querySelectorAll(
                [hcDataLabelsSelector, gravityChartsDataLabelsSelector].join(','),
            );

            return (
                Array.from(labels)
                    .map((l) => l.textContent)
                    .filter((l): l is string => l !== null)
                    // Replacement is in progress
                    .map((l) => l.replace(/\u00a0/g, ' '))
            );
        });

        return values.length === expectedLength;
    }).catch(() => {
        throw new Error(
            `Expected number of labels was ${expectedLength}, but result is ${values.length}`,
        );
    });

    return values;
}

datalensTest.describe('Wizard - formatting signatures (line)', () => {
    datalensTest.beforeEach(async ({page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Line);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
    });

    datalensTest(
        'If the signatures contain Measure Values, then the settings are taken from the tooltip settings',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Labels,
                'Measure Values',
            );

            const initialLabels = await getChartLabelValues(wizardPage.page, 3);

            expect(initialLabels).toEqual(EXPECTED_INITIAL_LABELS);

            await wizardPage.visualizationItemDialog.open(PlaceholderName.Y, 'Sales');

            await wizardPage.visualizationItemDialog.changeInputValue(
                DialogFieldMainSectionQa.PrecisionInput,
                '4',
            );

            const promise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await promise;

            let labelsAfterPrecisionChange: string[];

            await waitForCondition(async () => {
                labelsAfterPrecisionChange = await getChartLabelValues(wizardPage.page, 3);
                return labelsAfterPrecisionChange.join(',') === EXPECTED_FORMATTED_LABELS.join(',');
            }).catch(() => {
                throw new Error(
                    `Formatting was not applied.
                    Expected: ${EXPECTED_FORMATTED_LABELS.join(', ')};
                    Result: ${labelsAfterPrecisionChange.join(', ')}`,
                );
            });
        },
    );
});

datalensTest.describe('Wizard - formatting signatures (pie, donut)', () => {
    datalensTest(
        'When changing the "Signature Value" setting, it is saved in the field',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

            await wizardPage.setVisualization(WizardVisualizationId.Pie);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Dimensions,
                'Category',
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Profit',
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Labels, 'Profit');

            await wizardPage.visualizationItemDialog.open(PlaceholderName.Labels, 'Profit');

            await wizardPage.visualizationItemDialog.changeSelectorValue(
                DialogFieldMainSectionQa.LabelModeSelector,
                DialogFieldLabelModeValuesQa.Percent,
            );

            const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await apiRunPromise;
            await wizardPage.chartkit.waitUntilLoaderExists();

            const labels = await getChartLabelValues(wizardPage.page, 3);

            expect(labels).toEqual(EXPECTED_LABELS_WITH_LABEL_MODE_PERCENT);

            await wizardPage.visualizationItemDialog.open(PlaceholderName.Labels, 'Profit');

            const value = await wizardPage.visualizationItemDialog.getSelectorCurrentValue(
                DialogFieldMainSectionQa.LabelModeSelector,
            );

            expect(value).toEqual(DialogFieldLabelModeValuesQa.Percent);
        },
    );
});
