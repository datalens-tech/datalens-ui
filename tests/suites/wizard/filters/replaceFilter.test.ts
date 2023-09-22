import {Page} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard filters', () => {
    datalensTest(
        'When dragging, the filter must be correctly replaced by another filter',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

            await wizardPage.sectionVisualization.addFieldByDragAndDrop(
                PlaceholderName.Filters,
                'City',
            );

            await wizardPage.filterEditor.selectValues(['Jejsk']);

            await wizardPage.filterEditor.apply();

            await wizardPage.sectionVisualization.waitForPlaceholderFields(
                PlaceholderName.Filters,
                ['City'],
            );

            await wizardPage.sectionVisualization.replaceFieldByDragAndDrop(
                PlaceholderName.Filters,
                'City',
                'Population String',
            );

            await wizardPage.filterEditor.selectValues(['100100']);

            await wizardPage.filterEditor.apply();

            await wizardPage.sectionVisualization.waitForPlaceholderFields(
                PlaceholderName.Filters,
                ['Population String'],
            );
        },
    );
});
