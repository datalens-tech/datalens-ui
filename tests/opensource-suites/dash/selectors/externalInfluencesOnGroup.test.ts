import {Page, expect} from '@playwright/test';

import {
    ControlQA,
    DashCommonQa,
    DashRelationTypes,
    DialogControlQa,
    Feature,
} from '../../../../src/shared';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {isEnabledFeature, openTestPage, slct} from '../../../utils';
import {CommonUrls} from '../../../page-objects/constants/common-urls';

const PARAMS = {
    MANUAL_OUTSIDE_SELECTOR: {
        appearance: {
            title: 'outside-control',
        },
        fieldName: 'outside-control-1',
        elementType: {
            qa: slct(DialogControlQa.typeControlInput),
        },
    },
    MANUAL_FIRST_SELECTOR: {
        appearance: {
            title: 'test-control-1',
        },
        fieldName: 'test-control-field-1',
        elementType: {
            qa: slct(DialogControlQa.typeControlInput),
        },
    },
    MANUAL_SECOND_SELECTOR: {
        appearance: {
            title: 'test-control-2',
        },
        fieldName: 'test-control-field-2',
        elementType: {
            qa: slct(DialogControlQa.typeControlInput),
        },
    },
    INPUT_TEXT_VALUE: 'text for autoupdate',
    SIDE_TEXT_VALUE: 'side text value',
};

const getUrlWithoutState = (page: Page) => {
    const url = new URL(page.url());

    url.search = '';

    return url.toString();
};

datalensTest.describe(
    'Dashboards - The influence of the selector outside the group on the group',
    () => {
        let skipAfterEach = false;

        datalensTest.beforeEach(async ({page}: {page: Page}) => {
            // some page need to be loaded so we can get data of feature flag from DL var
            await openTestPage(page, '/');

            const isEnabledGroupControls = await isEnabledFeature(page, Feature.GroupControls);

            if (!isEnabledGroupControls) {
                skipAfterEach = true;
                // Test is immediately aborted when you call skip, it goes straight to afterEach
                datalensTest.skip();
            }
        });
        datalensTest.afterEach(async ({page}: {page: Page}) => {
            if (skipAfterEach) {
                return;
            }

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
                            await dashboardPage.controlActions.getDashControlLinksIconElem(
                                ControlQA.controlLinks,
                            );

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
                            await dashboardPage.controlActions.getDashControlLinksIconElem(
                                ControlQA.controlLinks,
                                1,
                            );

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
                });
                const groupLoader = page
                    .locator(ControlQA.groupChartkitControl)
                    .first()
                    .locator(slct(ControlQA.groupCommonLoader));
                const singleLoader = page
                    .locator(ControlQA.groupChartkitControl)
                    .nth(1)
                    .locator(slct(ControlQA.groupCommonLoader));

                await groupLoader.waitFor({state: 'hidden'});
                await singleLoader.waitFor({state: 'hidden'});

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

                expect(firstControlValue).toEqual(PARAMS.INPUT_TEXT_VALUE);
                expect(secondControlValue).toEqual(firstControlValue);

                await page.waitForResponse(CommonUrls.CreateDashState);

                // check that state is correctly applied after reload
                await page.reload();

                await groupLoader.waitFor({state: 'hidden'});
                await singleLoader.waitFor({state: 'hidden'});

                const firstControlValueAfterReload = await firstControlLocator.inputValue();
                const secondControlValueAfterReload = await secondControlLocator.inputValue();

                expect(firstControlValueAfterReload).toEqual(PARAMS.INPUT_TEXT_VALUE);
                expect(secondControlValueAfterReload).toEqual(firstControlValue);

                // disable autoupdate in group
                await dashboardPage.disableAutoupdateInFirstControl();

                // reload page without state
                await page.goto(getUrlWithoutState(page));
                await groupLoader.waitFor({state: 'hidden'});
                await singleLoader.waitFor({state: 'hidden'});

                await singleControl.fill(PARAMS.INPUT_TEXT_VALUE);
                await singleControl.blur();

                const firstControlValueWithoutAutoupdate = await firstControlLocator.inputValue();
                const secondControlValueWithoutAutoupdate = await secondControlLocator.inputValue();

                expect(firstControlValueWithoutAutoupdate).toEqual(PARAMS.INPUT_TEXT_VALUE);
                expect(secondControlValueWithoutAutoupdate).toEqual('');
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
                            await dashboardPage.controlActions.getDashControlLinksIconElem(
                                ControlQA.controlLinks,
                            );

                        await dashboardPage.setupNewLinks({
                            linkType: DashRelationTypes.both,
                            firstParamName: PARAMS.MANUAL_FIRST_SELECTOR.fieldName,
                            secondParamName: PARAMS.MANUAL_OUTSIDE_SELECTOR.fieldName,
                            widgetElem: singleSelectorElem,
                        });
                    },
                });
                const loader = page.locator(slct(ControlQA.groupCommonLoader));
                await loader.waitFor({state: 'hidden'});

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

                expect(firstControlValue).toEqual(PARAMS.INPUT_TEXT_VALUE);
                expect(secondControlValue).toEqual(PARAMS.SIDE_TEXT_VALUE);

                // disable autoupdate in group
                await dashboardPage.disableAutoupdateInFirstControl();

                // reload page without state
                await page.goto(getUrlWithoutState(page));
                await loader.waitFor({state: 'hidden'});

                await secondControlLocator.fill(PARAMS.SIDE_TEXT_VALUE);

                await singleControl.fill(PARAMS.INPUT_TEXT_VALUE);
                await singleControl.blur();

                const firstControlValueWithoutAutoupdate = await firstControlLocator.inputValue();
                const secondControlValueWithoutAutoupdate = await secondControlLocator.inputValue();

                expect(firstControlValueWithoutAutoupdate).toEqual(PARAMS.INPUT_TEXT_VALUE);
                expect(secondControlValueWithoutAutoupdate).toEqual(PARAMS.SIDE_TEXT_VALUE);
            },
        );
    },
);
