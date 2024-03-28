import {Page} from '@playwright/test';
import _isEqual from 'lodash/isEqual';
import flatten from 'lodash/flatten';

import {
    DialogFieldGroupingSelectorValuesQa,
    DialogFieldMainSectionQa,
    DialogFieldTypeSelectorValuesQa,
    WizardVisualizationId,
} from '../../../../src/shared';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const DATETIME_FIELD_NAME = '__test_field_DATETIME';

datalensTest.describe('Wizard - date grouping', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.FlatTable);
    });

    datalensTest('Grouping dates by years when creating a new chart', async ({page}) => {
        const wizardPage = new WizardPage({page});
        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            'DATE',
        );
        const expectedBeforeGrouping = [
            '03.01.2014',
            '04.01.2014',
            '05.01.2014',
            '06.01.2014',
            '07.01.2014',
            '09.01.2014',
            '10.01.2014',
            '11.01.2014',
            '13.01.2014',
            '14.01.2014',
            '15.01.2014',
            '16.01.2014',
            '18.01.2014',
            '19.01.2014',
            '20.01.2014',
            '21.01.2014',
            '23.01.2014',
            '26.01.2014',
            '27.01.2014',
            '28.01.2014',
            '30.01.2014',
            '31.01.2014',
            '01.02.2014',
            '02.02.2014',
            '03.02.2014',
            '04.02.2014',
            '06.02.2014',
            '07.02.2014',
            '08.02.2014',
            '11.02.2014',
            '12.02.2014',
            '14.02.2014',
            '15.02.2014',
            '16.02.2014',
            '17.02.2014',
            '18.02.2014',
            '20.02.2014',
            '21.02.2014',
            '22.02.2014',
            '23.02.2014',
            '24.02.2014',
            '27.02.2014',
            '01.03.2014',
            '02.03.2014',
            '03.03.2014',
            '04.03.2014',
            '05.03.2014',
            '07.03.2014',
            '10.03.2014',
            '11.03.2014',
            '14.03.2014',
            '15.03.2014',
            '16.03.2014',
            '17.03.2014',
            '18.03.2014',
            '19.03.2014',
            '21.03.2014',
            '22.03.2014',
            '23.03.2014',
            '24.03.2014',
            '25.03.2014',
            '26.03.2014',
            '28.03.2014',
            '29.03.2014',
            '30.03.2014',
            '31.03.2014',
            '01.04.2014',
            '02.04.2014',
            '03.04.2014',
            '04.04.2014',
            '05.04.2014',
            '06.04.2014',
            '07.04.2014',
            '08.04.2014',
            '11.04.2014',
            '12.04.2014',
            '13.04.2014',
            '15.04.2014',
            '16.04.2014',
            '18.04.2014',
            '19.04.2014',
            '20.04.2014',
            '21.04.2014',
            '22.04.2014',
            '23.04.2014',
            '25.04.2014',
            '26.04.2014',
            '28.04.2014',
            '29.04.2014',
            '30.04.2014',
            '02.05.2014',
            '03.05.2014',
            '04.05.2014',
            '05.05.2014',
            '06.05.2014',
            '07.05.2014',
            '08.05.2014',
            '09.05.2014',
            '10.05.2014',
            '11.05.2014',
        ];
        const expectedAfterGrouping = ['01.01.2014', '01.01.2015', '01.01.2016', '01.01.2017'];

        const tableContent = await wizardPage.chartkit.getRowsTexts();
        expect(flatten(tableContent)).toEqual(expectedBeforeGrouping);

        await wizardPage.openPlaceholderFieldSettings(PlaceholderName.FlatTableColumns, 'DATE');

        // Setting the Date field to be grouped by year
        await wizardPage.page.click(`${slct(DialogFieldMainSectionQa.GroupingSelector)}`);
        await wizardPage.page.click(slct(DialogFieldGroupingSelectorValuesQa.TruncYear));
        await wizardPage.page.click(`${slct('field-dialog-apply')}`);

        await waitForCondition(async () => {
            return _isEqual(
                flatten(await wizardPage.chartkit.getRowsTexts()),
                expectedAfterGrouping,
            );
        });
    });

    datalensTest(
        'When changing the grouping, the format of the field should remain the same',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            const changeGrouping = async (value: DialogFieldGroupingSelectorValuesQa) => {
                await wizardPage.visualizationItemDialog.changeSelectorValue(
                    DialogFieldMainSectionQa.GroupingSelector,
                    value,
                );

                const successfulResponsePromise = wizardPage.waitForSuccessfulResponse('/api/run');

                await wizardPage.visualizationItemDialog.clickOnApplyButton();

                await successfulResponsePromise;
            };

            const openPlaceholderAndGetTypeSelector = async () => {
                await wizardPage.visualizationItemDialog.open(
                    PlaceholderName.FlatTableColumns,
                    DATETIME_FIELD_NAME,
                );

                return await wizardPage.visualizationItemDialog.getSelectorCurrentValue(
                    DialogFieldMainSectionQa.TypeSelector,
                );
            };

            await wizardPage.createNewFieldWithFormula(DATETIME_FIELD_NAME, 'DATETIME([DATE])');

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                DATETIME_FIELD_NAME,
            );

            let selectorTypeValue = await openPlaceholderAndGetTypeSelector();

            expect(selectorTypeValue).toEqual(DialogFieldTypeSelectorValuesQa.GenericDatetime);

            await changeGrouping(DialogFieldGroupingSelectorValuesQa.TruncHour);

            selectorTypeValue = await openPlaceholderAndGetTypeSelector();

            expect(selectorTypeValue).toEqual(DialogFieldTypeSelectorValuesQa.GenericDatetime);

            await changeGrouping(DialogFieldGroupingSelectorValuesQa.None);

            selectorTypeValue = await openPlaceholderAndGetTypeSelector();

            expect(selectorTypeValue).toEqual(DialogFieldTypeSelectorValuesQa.GenericDatetime);

            await changeGrouping(DialogFieldGroupingSelectorValuesQa.TruncMinute);

            selectorTypeValue = await openPlaceholderAndGetTypeSelector();

            expect(selectorTypeValue).toEqual(DialogFieldTypeSelectorValuesQa.GenericDatetime);
        },
    );

    datalensTest(
        'When changing the "Date" type to "Date and Time", the groupings should change',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            const expectedDateListItems = [
                DialogFieldGroupingSelectorValuesQa.None,
                DialogFieldGroupingSelectorValuesQa.TruncYear,
                DialogFieldGroupingSelectorValuesQa.TruncQuarter,
                DialogFieldGroupingSelectorValuesQa.TruncMonth,
                DialogFieldGroupingSelectorValuesQa.TruncWeek,
                DialogFieldGroupingSelectorValuesQa.TruncDay,
                DialogFieldGroupingSelectorValuesQa.PartYear,
                DialogFieldGroupingSelectorValuesQa.PartQuarter,
                DialogFieldGroupingSelectorValuesQa.PartMonth,
                DialogFieldGroupingSelectorValuesQa.PartWeek,
                DialogFieldGroupingSelectorValuesQa.PartDay,
                DialogFieldGroupingSelectorValuesQa.PartDayOfWeek,
            ];
            const expectedDateAndTimeListItems = [
                DialogFieldGroupingSelectorValuesQa.None,
                DialogFieldGroupingSelectorValuesQa.TruncYear,
                DialogFieldGroupingSelectorValuesQa.TruncQuarter,
                DialogFieldGroupingSelectorValuesQa.TruncMonth,
                DialogFieldGroupingSelectorValuesQa.TruncWeek,
                DialogFieldGroupingSelectorValuesQa.TruncDay,
                DialogFieldGroupingSelectorValuesQa.TruncHour,
                DialogFieldGroupingSelectorValuesQa.TruncMinute,
                DialogFieldGroupingSelectorValuesQa.TruncSecond,
                DialogFieldGroupingSelectorValuesQa.PartYear,
                DialogFieldGroupingSelectorValuesQa.PartQuarter,
                DialogFieldGroupingSelectorValuesQa.PartMonth,
                DialogFieldGroupingSelectorValuesQa.PartWeek,
                DialogFieldGroupingSelectorValuesQa.PartDay,
                DialogFieldGroupingSelectorValuesQa.PartDayOfWeek,
                DialogFieldGroupingSelectorValuesQa.PartHour,
                DialogFieldGroupingSelectorValuesQa.PartMinute,
                DialogFieldGroupingSelectorValuesQa.PartSecond,
            ];

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'DATE',
            );

            await wizardPage.visualizationItemDialog.open(PlaceholderName.FlatTableColumns, 'DATE');

            const dateListValues = await wizardPage.visualizationItemDialog.getSelectorListValues(
                DialogFieldMainSectionQa.GroupingSelector,
            );

            expect(dateListValues).toEqual(expectedDateListItems);

            await wizardPage.visualizationItemDialog.changeSelectorValue(
                DialogFieldMainSectionQa.TypeSelector,
                DialogFieldTypeSelectorValuesQa.GenericDatetime,
            );

            const dateAndTimeListValues =
                await wizardPage.visualizationItemDialog.getSelectorListValues(
                    DialogFieldMainSectionQa.GroupingSelector,
                );

            expect(dateAndTimeListValues).toEqual(expectedDateAndTimeListItems);
        },
    );
});
