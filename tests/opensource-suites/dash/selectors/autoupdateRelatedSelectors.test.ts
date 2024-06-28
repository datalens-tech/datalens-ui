import {Page, expect} from '@playwright/test';

import {
    ControlQA,
    DashCommonQa,
    DashRelationTypes,
    DashTabItemControlSourceType,
    DialogControlQa,
    Feature,
} from '../../../../src/shared';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {getStringFullUrl, isEnabledFeature, openTestPage, slct} from '../../../utils';
import {TestParametrizationConfig} from '../../../types/config';

const PARAMS = {
    DATASET_FIRST_CONTROL: {
        appearance: {
            title: 'state',
        },
        sourceType: DashTabItemControlSourceType.Dataset,
        datasetField: {
            innerText: 'state',
        },
    },
    DATASET_SECOND_CONTROL: {
        appearance: {
            title: 'city',
        },
        sourceType: DashTabItemControlSourceType.Dataset,
        datasetField: {
            innerText: 'city',
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
    STATE_VALUE: 'Vermont',
    CITY_VALUE: 'Burlington',
    INPUT_TEXT_VALUE: 'text for autoupdate',
};

const getSecondSelectItemsCount = async (dashboardPage: DashboardPage) => {
    const cityItemsLocator = await dashboardPage.controlActions.getSelectItemsLocatorByTitle(
        PARAMS.DATASET_SECOND_CONTROL.appearance.title,
    );

    return await cityItemsLocator.count();
};

datalensTest.describe('Dashboards - Autoupdate options of group selectors', () => {
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
        'Dataset selectors affect each other before applying when auto-update is enabled',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelectorsGroup(
                        [
                            {
                                ...PARAMS.DATASET_FIRST_CONTROL,
                                dataset: {
                                    link: getStringFullUrl(config.datasets.entities.Basic.url),
                                },
                            },
                            {
                                ...PARAMS.DATASET_SECOND_CONTROL,
                                dataset: {
                                    link: getStringFullUrl(config.datasets.entities.Basic.url),
                                },
                            },
                        ],
                        {buttonApply: true, updateControlOnChange: true},
                    );
                },
            });
            const loader = page.locator(slct(ControlQA.groupCommonLoader));
            await loader.waitFor({state: 'hidden'});

            expect(await getSecondSelectItemsCount(dashboardPage)).toBeGreaterThan(1);

            // select influencing value
            await dashboardPage.controlActions.selectControlValueByTitle(
                PARAMS.DATASET_FIRST_CONTROL.appearance.title,
                PARAMS.STATE_VALUE,
            );

            // wait for requests after update
            await loader.waitFor({state: 'visible'});
            await loader.waitFor({state: 'hidden'});

            const cityItemsLocator =
                await dashboardPage.controlActions.getSelectItemsLocatorByTitle(
                    PARAMS.DATASET_SECOND_CONTROL.appearance.title,
                );

            expect(cityItemsLocator.first()).toHaveText(PARAMS.CITY_VALUE);
            const cityResultItemsCount = await cityItemsLocator.count();

            expect(cityResultItemsCount).toEqual(1);
        },
    );

    datalensTest(
        "Dataset selectors don't affect each other before applying when auto-update is disabled",
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelectorsGroup(
                        [
                            {
                                ...PARAMS.DATASET_FIRST_CONTROL,
                                dataset: {
                                    link: getStringFullUrl(config.datasets.entities.Basic.url),
                                },
                            },
                            {
                                ...PARAMS.DATASET_SECOND_CONTROL,
                                dataset: {
                                    link: getStringFullUrl(config.datasets.entities.Basic.url),
                                },
                            },
                        ],
                        {buttonApply: true},
                    );
                },
            });
            const loader = page.locator(slct(ControlQA.groupCommonLoader));
            await loader.waitFor({state: 'hidden'});

            // check that initial count of items
            const cityItemsCount = await getSecondSelectItemsCount(dashboardPage);
            expect(cityItemsCount).toBeGreaterThan(1);

            // select influencing value
            await dashboardPage.controlActions.selectControlValueByTitle(
                PARAMS.DATASET_FIRST_CONTROL.appearance.title,
                PARAMS.STATE_VALUE,
            );

            expect(await getSecondSelectItemsCount(dashboardPage)).toEqual(cityItemsCount);

            await page.locator(slct(ControlQA.controlButtonApply)).click();

            await loader.waitFor({state: 'hidden'});

            // after apply the range of values should decrease due to the influence of first selector
            await page.pause();
            expect(await getSecondSelectItemsCount(dashboardPage)).toEqual(1);
        },
    );

    datalensTest(
        'Manual selectors with aliases affect each other before applying when auto-update is enabled',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelectorsGroup(
                        [PARAMS.MANUAL_FIRST_SELECTOR, PARAMS.MANUAL_SECOND_SELECTOR],
                        {buttonApply: true, updateControlOnChange: true},
                    );

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
                },
            });
            const loader = page.locator(slct(ControlQA.groupCommonLoader));
            await loader.waitFor({state: 'hidden'});

            const firstControl = dashboardPage
                .getSelectorLocatorByTitle({
                    title: PARAMS.MANUAL_FIRST_SELECTOR.appearance.title,
                    type: 'input',
                })
                .locator('input');

            await firstControl.fill(PARAMS.INPUT_TEXT_VALUE);
            await firstControl.blur();

            await loader.waitFor({state: 'hidden'});

            const secondSelectorValue = await dashboardPage
                .getSelectorLocatorByTitle({
                    title: PARAMS.MANUAL_SECOND_SELECTOR.appearance.title,
                    type: 'input',
                })
                .locator('input')
                .inputValue();

            expect(secondSelectorValue).toEqual(PARAMS.INPUT_TEXT_VALUE);
        },
    );

    datalensTest(
        "Manual selectors with aliases don't affect each other before applying when auto-update is disabled",
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelectorsGroup(
                        [PARAMS.MANUAL_FIRST_SELECTOR, PARAMS.MANUAL_SECOND_SELECTOR],
                        {buttonApply: true},
                    );

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
                },
            });
            const loader = page.locator(slct(ControlQA.groupCommonLoader));
            await loader.waitFor({state: 'hidden'});

            const firstControl = dashboardPage
                .getSelectorLocatorByTitle({
                    title: PARAMS.MANUAL_FIRST_SELECTOR.appearance.title,
                    type: 'input',
                })
                .locator('input');

            await firstControl.fill(PARAMS.INPUT_TEXT_VALUE);
            await firstControl.blur();

            const secondSelectorValue = await dashboardPage
                .getSelectorLocatorByTitle({
                    title: PARAMS.MANUAL_SECOND_SELECTOR.appearance.title,
                    type: 'input',
                })
                .locator('input')
                .inputValue();

            await expect(secondSelectorValue).toEqual('');

            // TODO: Return check after CHARTS-9889
            // await page.locator(slct(ControlQA.controlButtonApply)).click();

            // await loader.waitFor({state: 'hidden'});

            // // last changed param will be applied to both selectors
            // const firstSelectorValueAfterApply = await dashboardPage
            //     .getSelectorLocatorByTitle({
            //         title: PARAMS.MANUAL_SECOND_SELECTOR.appearance.title,
            //         type: 'input',
            //     })
            //     .locator('input')
            //     .inputValue();

            // expect(firstSelectorValueAfterApply).toEqual(PARAMS.INPUT_TEXT_VALUE);
        },
    );

    datalensTest(
        "Dataset selectors with ignore don't affect each other with any auto-update setting",
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelectorsGroup(
                        [
                            {
                                ...PARAMS.DATASET_FIRST_CONTROL,
                                dataset: {
                                    link: getStringFullUrl(config.datasets.entities.Basic.url),
                                },
                            },
                            {
                                ...PARAMS.DATASET_SECOND_CONTROL,
                                dataset: {
                                    link: getStringFullUrl(config.datasets.entities.Basic.url),
                                },
                            },
                        ],
                        {buttonApply: true, updateControlOnChange: true},
                    );

                    const selectorElem =
                        await dashboardPage.controlActions.getDashControlLinksIconElem(
                            ControlQA.controlLinks,
                        );

                    await selectorElem.click();

                    // choose new link
                    await page.click(slct(DashCommonQa.RelationTypeButton));
                    await page.click(slct(DashRelationTypes.ignore));

                    await dashboardPage.applyRelationsChanges();
                },
            });
            const loader = page.locator(slct(ControlQA.groupCommonLoader));
            await loader.waitFor({state: 'hidden'});

            // check that initial count of items more than 1
            const initialItemsCount = await getSecondSelectItemsCount(dashboardPage);

            expect(initialItemsCount).toBeGreaterThan(1);

            // select influencing value
            await dashboardPage.controlActions.selectControlValueByTitle(
                PARAMS.DATASET_FIRST_CONTROL.appearance.title,
                PARAMS.STATE_VALUE,
            );

            // wait for requests after update
            await loader.waitFor({state: 'visible'});
            await loader.waitFor({state: 'hidden'});

            expect(await getSecondSelectItemsCount(dashboardPage)).toEqual(initialItemsCount);

            // disable autoupdate
            await dashboardPage.disableAutoupdateInFirstControl();

            await page.reload();

            // Check that there is no state
            const pageURL = new URL(page.url());
            expect(pageURL.searchParams.get('state')).toEqual(null);

            // select influencing value
            await dashboardPage.controlActions.selectControlValueByTitle(
                PARAMS.DATASET_FIRST_CONTROL.appearance.title,
                PARAMS.STATE_VALUE,
            );

            // check that count of items doesn't change
            expect(await getSecondSelectItemsCount(dashboardPage)).toEqual(initialItemsCount);

            await page.locator(slct(ControlQA.controlButtonApply)).click();

            await loader.waitFor({state: 'hidden'});

            // check that count of items still doesn't change
            expect(await getSecondSelectItemsCount(dashboardPage)).toEqual(initialItemsCount);
        },
    );
});
