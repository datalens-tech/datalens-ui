import {Page} from '@playwright/test';
import moment from 'moment';
import {DEFAULT_DATE_FORMAT, Operations} from '../../../../src/shared';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {SCALES} from '../../../../src/shared/constants/datepicker/relative-datepicker';

// In the test dataset, the maximum date that can be selected in datepicker is 2017
const FIXED_TEST_YEAR_VALUE = 2017;
const CURRENT_YEAR_VALUE = new Date().getFullYear();

const getPreviousDayDate = (value: number, period: (typeof SCALES)[keyof typeof SCALES]) => {
    const date = moment.utc();
    switch (period) {
        case SCALES.y:
            {
                const fullyear = date.year();
                // In order for the tests to always work, you need to subtract the difference between the current year and the test year from the current year
                date.year(fullyear - (fullyear - FIXED_TEST_YEAR_VALUE) - value);
            }
            break;
        default:
            date.date(date.date() - value);
            break;
    }
    date.hours(0);
    return date.format(DEFAULT_DATE_FORMAT);
};

datalensTest.describe('Wizard section "Filters" (with selected date or date time)', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'DATE');
    });

    datalensTest(
        'When selecting a date in the filter, it should be displayed in the field that lies in the section',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const expectedDate = '04.12.2017';

            await wizardPage.filterEditor.selectFilterOperation(Operations.EQ);

            await wizardPage.filterEditor.selectDate(expectedDate);

            await wizardPage.filterEditor.apply();

            let placeholderItemValue: string[];
            await waitForCondition(async () => {
                placeholderItemValue =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.Filters,
                    );
                return placeholderItemValue.join() === `DATE: ${expectedDate}`;
            });
        },
    );

    datalensTest(
        'When selecting a period in the filter, it should be displayed in the field that lies in the section',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const expectedDates: [string, string] = ['04.12.2017', '06.12.2017'];

            await wizardPage.filterEditor.selectRangeDate(expectedDates);

            await wizardPage.filterEditor.apply();
            let placeholderItemValue: string[];
            await waitForCondition(async () => {
                placeholderItemValue =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.Filters,
                    );
                return placeholderItemValue.join() === `DATE: ${expectedDates.join('-')}`;
            });
        },
    );

    datalensTest(
        'When selecting a date with an offset, it should be displayed in the field that lies in the section',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.filterEditor.selectFilterOperation(Operations.EQ);

            await wizardPage.filterEditor.selectRelativeDate({type: 'start'});

            const oneDayBefore = getPreviousDayDate(1, SCALES.d);

            await wizardPage.filterEditor.apply();

            let placeholderItemValue: string[];
            await waitForCondition(async () => {
                placeholderItemValue =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.Filters,
                    );

                return placeholderItemValue.join() === `DATE: ${oneDayBefore}`;
            });
        },
    );

    datalensTest(
        'When selecting a period with an offset, it should be displayed in the field that lies in the section',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.filterEditor.selectRelativeDate({type: 'start', value: '2'});

            await wizardPage.filterEditor.selectRelativeDate({type: 'end', value: '1'});

            const oneDayBefore = getPreviousDayDate(1, SCALES.d);
            const twoDaysBefore = getPreviousDayDate(2, SCALES.d);

            await wizardPage.filterEditor.apply();

            let placeholderItemValue: string[];
            await waitForCondition(async () => {
                placeholderItemValue =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.Filters,
                    );

                return placeholderItemValue.join() === `DATE: ${twoDaysBefore}-${oneDayBefore}`;
            });
        },
    );

    datalensTest(
        'In the interval, you can simultaneously select an offset date and a date from the calendar',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.filterEditor.selectRelativeDate({
                type: 'start',
                value: String(5 + (CURRENT_YEAR_VALUE - FIXED_TEST_YEAR_VALUE)),
                period: SCALES.y,
            });

            const endDate = '25.12.2017';
            const startDate = getPreviousDayDate(5, SCALES.y);

            await wizardPage.filterEditor.selectRangeDate([null, endDate]);

            await wizardPage.filterEditor.apply();

            let placeholderItemValue: string[];
            await waitForCondition(async () => {
                placeholderItemValue =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.Filters,
                    );

                return placeholderItemValue.join() === `DATE: ${startDate}-${endDate}`;
            }).catch(() => {
                throw new Error(
                    `The value in the filter [${placeholderItemValue}] does not match the expected value [DATE: ${startDate}-${endDate}]`,
                );
            });
        },
    );
});
