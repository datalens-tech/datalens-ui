import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {ChartSettingsItems} from '../../../page-objects/wizard/ChartSettings';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const isDuplicateRowsExists = async (wizardPage: WizardPage) => {
    const rowTexts: string[][] = await wizardPage.chartkit.getRowsTexts();

    const textsDict = rowTexts.reduce((acc: Record<string, number>, item) => {
        if (typeof acc[item.join()] === 'undefined') {
            acc[item.join()] = 0;
            return acc;
        }

        acc[item.join()] = acc[item.join()] + 1;

        return acc;
    }, {});

    const duplicateExists = Object.values(textsDict).some((item) => item > 0);

    return duplicateExists;
};

datalensTest.describe('Wizard - Chart Settings', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            'Population String',
        );

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'City');

        await wizardPage.filterEditor.selectValues(['Klimovsk', 'Krymsk']);

        await wizardPage.filterEditor.apply();
    });

    datalensTest(
        'The user can disable grouping for flat tables via chart settings',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await waitForCondition(async () => {
                return !(await isDuplicateRowsExists(wizardPage));
            }).catch(() => {
                throw new Error('Grouping was not enabled');
            });

            await wizardPage.chartSettings.open();

            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Groupping, 'off');

            await wizardPage.chartSettings.apply();

            await waitForCondition(async () => {
                return isDuplicateRowsExists(wizardPage);
            }).catch(() => {
                throw new Error("Grouping didn't turn off");
            });
        },
    );
});
