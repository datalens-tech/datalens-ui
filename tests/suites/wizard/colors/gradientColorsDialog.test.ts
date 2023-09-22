import {Page} from '@playwright/test';

import {GeopointType, PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard - Gradient Color Dialog', () => {
    datalensTest(
        'The dialog should contain a switch to control the polygon boundaries',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardGeopoints);

            await wizardPage.sectionVisualization.setGeotype(GeopointType.Geopoligons);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Geopoligon,
                'polygon6',
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                '_someMeasure',
            );

            await wizardPage.colorDialog.open();

            await waitForCondition(async () => {
                return await wizardPage.page.$(slct('radio-buttons-polygon-borders'));
            }).catch(() => {
                throw new Error(
                    'The switch for polygon borders did not appear in the Colors Dialog',
                );
            });
        },
    );
});
