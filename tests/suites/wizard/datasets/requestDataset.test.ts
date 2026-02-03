import {Page, Route} from '@playwright/test';
import {SectionDatasetQA} from '../../../../src/shared';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const FAILED_DATASET_ID = 'bfvw78uczxp65';

datalensTest.describe('Wizard - loading dataset during chart opening', () => {
    datalensTest(
        'If the dataset has not loaded, then it should be possible to delete or replace the incorrect dataset',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({
                page,
            });

            await wizardPage.page.route(/getDatasetByVersion/, (route: Route) => {
                route.abort();
            });

            await openTestPage(page, RobotChartsWizardUrls.WizardLabels);

            // checking the display of the icon with information about the error
            await wizardPage.page.waitForSelector(
                `${slct(SectionDatasetQA.DatasetSelectItem)} ${wizardPage.datasetSelector.errorIconSelector}`,
            );

            // check the display of menu items for deleting and replacing the dataset
            await wizardPage.datasetSelector.openActionMenu(FAILED_DATASET_ID);

            await Promise.all(
                [SectionDatasetQA.ReplaceDatasetButton, SectionDatasetQA.RemoveDatasetButton].map(
                    (action) => {
                        return wizardPage.page.waitForSelector(
                            `${slct(SectionDatasetQA.DatasetSelectMoreMenu)} ${slct(action)}`,
                        );
                    },
                ),
            );
        },
    );
});
