import {Page, expect} from '@playwright/test';

import {
    ControlQA,
    DashCommonQa,
    DashRelationTypes,
    DashTabItemControlSourceType,
} from '../../../../src/shared';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {getStringFullUrl, slct} from '../../../utils';
import {TestParametrizationConfig} from '../../../types/config';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {SelectorElementType} from '../../../page-objects/dashboard/ControlActions';

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
        elementType: SelectorElementType.Input,
    },
    MANUAL_SECOND_SELECTOR: {
        appearance: {
            title: 'test-control-2',
        },
        fieldName: 'test-control-field-2',
        elementType: SelectorElementType.Input,
    },
    STATE_VALUE: 'Vermont',
    CITY_VALUE: 'Burlington',
    INPUT_TEXT_VALUE: 'text for autoupdate',
};

const SELECTORS_TITLES = {
    DATASET_SELECTORS: [
        PARAMS.DATASET_FIRST_CONTROL.appearance.title,
        PARAMS.DATASET_SECOND_CONTROL.appearance.title,
    ],
    MANUAL_SELECTORS: [
        PARAMS.MANUAL_FIRST_SELECTOR.appearance.title,
        PARAMS.MANUAL_SECOND_SELECTOR.appearance.title,
    ],
    FIRST_DATASET_SELECTOR: [PARAMS.DATASET_FIRST_CONTROL.appearance.title],
    SECOND_DATASET_SELECTOR: [PARAMS.DATASET_SECOND_CONTROL.appearance.title],
    SECOND_MANUAL_SELECTOR: [PARAMS.MANUAL_SECOND_SELECTOR.appearance.title],
};

const getSecondSelectItemsCount = async (dashboardPage: DashboardPage) => {
    const cityItemsLocator = await dashboardPage.controlActions.getSelectItemsLocatorByTitle(
        PARAMS.DATASET_SECOND_CONTROL.appearance.title,
    );

    return await cityItemsLocator.count();
};

datalensTest.describe('Dashboards - Autoupdate options of group selectors', () => {
    datalensTest.afterEach(async ({page, config}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.deleteDash({workbookId: config.workbookId});
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
                waitingRequestOptions: {
                    controlTitles: SELECTORS_TITLES.DATASET_SELECTORS,
                    waitForLoader: true,
                },
                workbookId: config.workbookId,
            });

            await expect(await getSecondSelectItemsCount(dashboardPage)).toBeGreaterThan(1);

            await dashboardPage.expectControlsRequests({
                controlTitles: SELECTORS_TITLES.DATASET_SELECTORS,
                action: async () => {
                    // select influencing value
                    await dashboardPage.controlActions.selectControlValueByTitle(
                        PARAMS.DATASET_FIRST_CONTROL.appearance.title,
                        PARAMS.STATE_VALUE,
                    );
                },
                waitForLoader: true,
            });

            const cityItemsLocator =
                await dashboardPage.controlActions.getSelectItemsLocatorByTitle(
                    PARAMS.DATASET_SECOND_CONTROL.appearance.title,
                );

            await expect(cityItemsLocator.first()).toHaveText(PARAMS.CITY_VALUE);
            const cityResultItemsCount = await cityItemsLocator.count();

            await expect(cityResultItemsCount).toEqual(1);
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
                waitingRequestOptions: {
                    controlTitles: SELECTORS_TITLES.DATASET_SELECTORS,
                    waitForLoader: true,
                },
                workbookId: config.workbookId,
            });
            // check that initial count of items
            const cityItemsCount = await getSecondSelectItemsCount(dashboardPage);
            await expect(cityItemsCount).toBeGreaterThan(1);

            // select influencing value
            await dashboardPage.controlActions.selectControlValueByTitle(
                PARAMS.DATASET_FIRST_CONTROL.appearance.title,
                PARAMS.STATE_VALUE,
            );

            await expect(await getSecondSelectItemsCount(dashboardPage)).toEqual(cityItemsCount);

            await dashboardPage.expectControlsRequests({
                controlTitles: SELECTORS_TITLES.SECOND_DATASET_SELECTOR,
                action: async () => {
                    await page.locator(slct(ControlQA.controlButtonApply)).click();
                },
                waitForLoader: true,
            });

            // after apply the range of values should decrease due to the influence of first selector
            await expect(await getSecondSelectItemsCount(dashboardPage)).toEqual(1);
        },
    );

    datalensTest(
        'Manual selectors with aliases affect each other before applying when auto-update is enabled',
        async ({page, config}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelectorsGroup(
                        [PARAMS.MANUAL_FIRST_SELECTOR, PARAMS.MANUAL_SECOND_SELECTOR],
                        {buttonApply: true, updateControlOnChange: true},
                    );

                    const selectorElem =
                        await dashboardPage.controlActions.getDashControlLinksIconElem();

                    await dashboardPage.setupNewLinks({
                        linkType: DashRelationTypes.both,
                        firstParamName: PARAMS.MANUAL_FIRST_SELECTOR.fieldName,
                        secondParamName: PARAMS.MANUAL_SECOND_SELECTOR.fieldName,
                        widgetElem: selectorElem,
                    });
                },
                waitingRequestOptions: {
                    controlTitles: SELECTORS_TITLES.MANUAL_SELECTORS,
                    waitForLoader: true,
                },
                workbookId: config.workbookId,
            });

            const firstControl = dashboardPage
                .getSelectorLocatorByTitle({
                    title: PARAMS.MANUAL_FIRST_SELECTOR.appearance.title,
                    type: 'input',
                })
                .locator('input');

            await dashboardPage.expectControlsRequests({
                controlTitles: SELECTORS_TITLES.MANUAL_SELECTORS,
                action: async () => {
                    await firstControl.fill(PARAMS.INPUT_TEXT_VALUE);
                    await firstControl.blur();
                },
                waitForLoader: true,
            });

            const secondSelectorValue = await dashboardPage
                .getSelectorLocatorByTitle({
                    title: PARAMS.MANUAL_SECOND_SELECTOR.appearance.title,
                    type: 'input',
                })
                .locator('input')
                .inputValue();

            await expect(secondSelectorValue).toEqual(PARAMS.INPUT_TEXT_VALUE);
        },
    );

    datalensTest(
        "Manual selectors with aliases don't affect each other before applying when auto-update is disabled",
        async ({page, config}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelectorsGroup(
                        [PARAMS.MANUAL_FIRST_SELECTOR, PARAMS.MANUAL_SECOND_SELECTOR],
                        {buttonApply: true},
                    );

                    const selectorElem =
                        await dashboardPage.controlActions.getDashControlLinksIconElem();

                    await dashboardPage.setupNewLinks({
                        linkType: DashRelationTypes.both,
                        firstParamName: PARAMS.MANUAL_FIRST_SELECTOR.fieldName,
                        secondParamName: PARAMS.MANUAL_SECOND_SELECTOR.fieldName,
                        widgetElem: selectorElem,
                    });
                },
                waitingRequestOptions: {
                    controlTitles: SELECTORS_TITLES.MANUAL_SELECTORS,
                    waitForLoader: false,
                },
                workbookId: config.workbookId,
            });
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

            await dashboardPage.expectControlsRequests({
                controlTitles: SELECTORS_TITLES.SECOND_MANUAL_SELECTOR,
                waitForLoader: true,
                action: async () => {
                    await page.locator(slct(ControlQA.controlButtonApply)).click();
                },
            });

            // last changed param will be applied to both selectors
            const firstSelectorValueAfterApply = await dashboardPage
                .getSelectorLocatorByTitle({
                    title: PARAMS.MANUAL_SECOND_SELECTOR.appearance.title,
                    type: 'input',
                })
                .locator('input')
                .inputValue();

            await expect(firstSelectorValueAfterApply).toEqual(PARAMS.INPUT_TEXT_VALUE);
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
                        await dashboardPage.controlActions.getDashControlLinksIconElem();

                    await selectorElem.click();

                    // choose new link
                    await page.click(slct(DashCommonQa.RelationTypeButton));
                    await page.click(slct(DashRelationTypes.ignore));

                    await dashboardPage.applyRelationsChanges();
                },
                waitingRequestOptions: {
                    controlTitles: SELECTORS_TITLES.DATASET_SELECTORS,
                    waitForLoader: true,
                },
                workbookId: config.workbookId,
            });

            // check that initial count of items more than 1
            const initialItemsCount = await getSecondSelectItemsCount(dashboardPage);

            await expect(initialItemsCount).toBeGreaterThan(1);

            await dashboardPage.expectControlsRequests({
                controlTitles: SELECTORS_TITLES.FIRST_DATASET_SELECTOR,
                action: async () => {
                    // select influencing value
                    await dashboardPage.controlActions.selectControlValueByTitle(
                        PARAMS.DATASET_FIRST_CONTROL.appearance.title,
                        PARAMS.STATE_VALUE,
                    );
                },
                waitForLoader: true,
            });

            await expect(await getSecondSelectItemsCount(dashboardPage)).toEqual(initialItemsCount);

            // disable autoupdate
            await dashboardPage.disableAutoupdateInFirstControl();

            await page.reload();

            // Check that there is no state
            const pageURL = new URL(page.url());
            await expect(pageURL.searchParams.get('state')).toEqual(null);

            await dashboardPage.expectControlsRequests({
                controlTitles: SELECTORS_TITLES.FIRST_DATASET_SELECTOR,
                action: async () => {
                    // select influencing value
                    await dashboardPage.controlActions.selectControlValueByTitle(
                        PARAMS.DATASET_FIRST_CONTROL.appearance.title,
                        PARAMS.STATE_VALUE,
                    );
                },
            });

            // check that count of items doesn't change
            await expect(await getSecondSelectItemsCount(dashboardPage)).toEqual(initialItemsCount);

            await page.locator(slct(ControlQA.controlButtonApply)).click();

            await page.waitForResponse(CommonUrls.CreateDashState);

            // check that count of items still doesn't change
            await expect(await getSecondSelectItemsCount(dashboardPage)).toEqual(initialItemsCount);
        },
    );
});
