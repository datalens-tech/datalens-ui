import {Page, expect} from '@playwright/test';

import {DashCommonQa, DashRelationTypes} from '../../../../src/shared';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {slct} from '../../../utils';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {SelectorElementType} from '../../../page-objects/dashboard/ControlActions';

const PARAMS = {
    MANUAL_OUTSIDE_SELECTOR: {
        appearance: {
            title: 'outside-control',
        },
        fieldName: 'outside-control-1',
        elementType: SelectorElementType.Input,
    },
    MANUAL_FIRST_SELECTOR: {
        appearance: {
            title: 'test-control-1',
        },
        fieldName: 'test-control-field-1',
        elementType: SelectorElementType.Input,
    },
    MANUAL_SECOND_SELECTOR: {
        appearance: {
            title: 'test-control-2',
        },
        fieldName: 'test-control-field-2',
        elementType: SelectorElementType.Input,
    },
    INPUT_TEXT_VALUE: 'text for autoupdate',
    SIDE_TEXT_VALUE: 'side text value',
};

const SELECTORS_TITLES = {
    ALL_SELECTORS: [
        PARAMS.MANUAL_FIRST_SELECTOR.appearance.title,
        PARAMS.MANUAL_OUTSIDE_SELECTOR.appearance.title,
        PARAMS.MANUAL_SECOND_SELECTOR.appearance.title,
    ],
};

const getUrlWithoutState = (page: Page) => {
    const url = new URL(page.url());

    url.search = '';

    return url.toString();
};

datalensTest.describe(
    'Dashboards - The influence of the selector outside the group on the group',
    () => {
        datalensTest.afterEach(async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.deleteDash();
        });

        datalensTest(
            'A selector outside the group correctly affects one of the selectors associated with another selector by an alias inside the group',
            async ({page}: {page: Page}) => {
                const dashboardPage = new DashboardPage({page});

                await dashboardPage.createDashboard({
                    editDash: async () => {
                        await dashboardPage.controlActions.addSelectorsGroup(
                            [PARAMS.MANUAL_FIRST_SELECTOR, PARAMS.MANUAL_SECOND_SELECTOR],
                            {buttonApply: true, updateControlOnChange: true},
                        );

                        // set alias between selectors in group
                        const selectorElem =
                            await dashboardPage.controlActions.getDashControlLinksIconElem();

                        await dashboardPage.setupNewLinks({
                            linkType: DashRelationTypes.both,
                            firstParamName: PARAMS.MANUAL_FIRST_SELECTOR.fieldName,
                            secondParamName: PARAMS.MANUAL_SECOND_SELECTOR.fieldName,
                            widgetElem: selectorElem,
                        });

                        await dashboardPage.controlActions.addSelector(
                            PARAMS.MANUAL_OUTSIDE_SELECTOR,
                        );

                        // set alias between single selector and group
                        const singleSelectorElem =
                            await dashboardPage.controlActions.getDashControlLinksIconElem(1);

                        await dashboardPage.setupNewLinks({
                            linkType: DashRelationTypes.both,
                            firstParamName: PARAMS.MANUAL_OUTSIDE_SELECTOR.fieldName,
                            secondParamName: PARAMS.MANUAL_FIRST_SELECTOR.fieldName,
                            widgetElem: singleSelectorElem,
                        });

                        await singleSelectorElem.click();

                        // set ignore with second selector
                        await page.locator(slct(DashCommonQa.RelationTypeButton)).nth(1).click();
                        await page.click(slct(DashRelationTypes.ignore));

                        await dashboardPage.applyRelationsChanges();
                    },
                    waitingRequestOptions: {
                        controlTitles: SELECTORS_TITLES.ALL_SELECTORS,
                    },
                });

                const singleControl = dashboardPage
                    .getSelectorLocatorByTitle({
                        title: PARAMS.MANUAL_OUTSIDE_SELECTOR.appearance.title,
                        type: 'input',
                    })
                    .locator('input');

                await singleControl.fill(PARAMS.INPUT_TEXT_VALUE);
                await singleControl.blur();

                const firstControlLocator = dashboardPage
                    .getSelectorLocatorByTitle({
                        title: PARAMS.MANUAL_FIRST_SELECTOR.appearance.title,
                        type: 'input',
                    })
                    .locator('input');

                const secondControlLocator = dashboardPage
                    .getSelectorLocatorByTitle({
                        title: PARAMS.MANUAL_SECOND_SELECTOR.appearance.title,
                        type: 'input',
                    })
                    .locator('input');

                const firstControlValue = await firstControlLocator.inputValue();

                const secondControlValue = await secondControlLocator.inputValue();

                await expect(firstControlValue).toEqual(PARAMS.INPUT_TEXT_VALUE);
                await expect(secondControlValue).toEqual(firstControlValue);

                await page.waitForResponse(CommonUrls.CreateDashState);

                await dashboardPage.expectControlsRequests({
                    controlTitles: SELECTORS_TITLES.ALL_SELECTORS,

                    action: async () => {
                        // check that state is correctly applied after reload
                        await page.reload();
                    },
                });

                const firstControlValueAfterReload = await firstControlLocator.inputValue();
                const secondControlValueAfterReload = await secondControlLocator.inputValue();

                await expect(firstControlValueAfterReload).toEqual(PARAMS.INPUT_TEXT_VALUE);
                await expect(secondControlValueAfterReload).toEqual(firstControlValue);

                // disable autoupdate in group
                await dashboardPage.disableAutoupdateInFirstControl();

                await dashboardPage.expectControlsRequests({
                    controlTitles: SELECTORS_TITLES.ALL_SELECTORS,

                    action: async () => {
                        // reload page without state
                        await page.goto(getUrlWithoutState(page));
                    },
                });

                await singleControl.fill(PARAMS.INPUT_TEXT_VALUE);
                await singleControl.blur();

                const firstControlValueWithoutAutoupdate = await firstControlLocator.inputValue();
                const secondControlValueWithoutAutoupdate = await secondControlLocator.inputValue();

                await expect(firstControlValueWithoutAutoupdate).toEqual(PARAMS.INPUT_TEXT_VALUE);
                await expect(secondControlValueWithoutAutoupdate).toEqual('');
            },
        );

        datalensTest(
            'A selector outside the group does not reset the selector state values in group when influenced',
            async ({page}: {page: Page}) => {
                const dashboardPage = new DashboardPage({page});

                await dashboardPage.createDashboard({
                    editDash: async () => {
                        await dashboardPage.controlActions.addSelectorsGroup(
                            [PARAMS.MANUAL_FIRST_SELECTOR, PARAMS.MANUAL_SECOND_SELECTOR],
                            {buttonApply: true, updateControlOnChange: true},
                        );
                        await dashboardPage.controlActions.addSelector(
                            PARAMS.MANUAL_OUTSIDE_SELECTOR,
                        );

                        // set alias between single selector and one of group selector
                        const singleSelectorElem =
                            await dashboardPage.controlActions.getDashControlLinksIconElem();

                        await dashboardPage.setupNewLinks({
                            linkType: DashRelationTypes.both,
                            firstParamName: PARAMS.MANUAL_FIRST_SELECTOR.fieldName,
                            secondParamName: PARAMS.MANUAL_OUTSIDE_SELECTOR.fieldName,
                            widgetElem: singleSelectorElem,
                        });
                    },
                    waitingRequestOptions: {
                        controlTitles: SELECTORS_TITLES.ALL_SELECTORS,
                    },
                });

                const firstControlLocator = dashboardPage
                    .getSelectorLocatorByTitle({
                        title: PARAMS.MANUAL_FIRST_SELECTOR.appearance.title,
                        type: 'input',
                    })
                    .locator('input');

                const secondControlLocator = dashboardPage
                    .getSelectorLocatorByTitle({
                        title: PARAMS.MANUAL_SECOND_SELECTOR.appearance.title,
                        type: 'input',
                    })
                    .locator('input');

                await secondControlLocator.fill(PARAMS.SIDE_TEXT_VALUE);

                const singleControl = dashboardPage
                    .getSelectorLocatorByTitle({
                        title: PARAMS.MANUAL_OUTSIDE_SELECTOR.appearance.title,
                        type: 'input',
                    })
                    .locator('input');

                await singleControl.fill(PARAMS.INPUT_TEXT_VALUE);
                await singleControl.blur();

                const firstControlValue = await firstControlLocator.inputValue();
                const secondControlValue = await secondControlLocator.inputValue();

                await expect(firstControlValue).toEqual(PARAMS.INPUT_TEXT_VALUE);
                await expect(secondControlValue).toEqual(PARAMS.SIDE_TEXT_VALUE);

                await page.waitForResponse(CommonUrls.CreateDashState);

                // disable autoupdate in group
                await dashboardPage.disableAutoupdateInFirstControl();

                await dashboardPage.expectControlsRequests({
                    controlTitles: SELECTORS_TITLES.ALL_SELECTORS,
                    action: async () => {
                        // reload page without state
                        await page.goto(getUrlWithoutState(page));
                    },
                });

                await secondControlLocator.fill(PARAMS.SIDE_TEXT_VALUE);

                await singleControl.fill(PARAMS.INPUT_TEXT_VALUE);
                await singleControl.blur();

                const firstControlValueWithoutAutoupdate = await firstControlLocator.inputValue();
                const secondControlValueWithoutAutoupdate = await secondControlLocator.inputValue();

                await expect(firstControlValueWithoutAutoupdate).toEqual(PARAMS.INPUT_TEXT_VALUE);
                await expect(secondControlValueWithoutAutoupdate).toEqual(PARAMS.SIDE_TEXT_VALUE);
            },
        );
    },
);
