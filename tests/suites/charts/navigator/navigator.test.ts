import {Page} from '@playwright/test';

import {ChartSettingsItems} from '../../../page-objects/wizard/ChartSettings';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Chart Navigator', () => {
    datalensTest(
        'In the saved chart with the navigator, the navigator setting should be displayed at the first render without changes',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, RobotChartsWizardUrls.WizardWithNavigator);

            await wizardPage.chartSettings.open();

            await wizardPage.chartSettings.waitForSettingsRender();

            await wizardPage.chartSettings.getSettingItem(ChartSettingsItems.Navigator);
        },
    );
});
