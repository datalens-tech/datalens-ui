import {expect} from '@playwright/test';
import {
    AvatarQA,
    DatasetSourcesLeftPanelQA,
    DatasetSourcesTableQa,
} from '../../../../src/shared/constants';
import DatasetPage from '../../../page-objects/dataset/DatasetPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {dbNamesMock, getSourceListingOptionsMock, getSourcesMock, requestUrls} from './mock-data';
import {mockResponseBody} from './helpers';
import {RobotChartsDatasetUrls} from '../../../utils/constants';

const SEARCH_VALUE = 'abcd';
const PAGINATION_LIMIT = 101;
const PAGINATION_OFFSET = 100;

const setupMocks = async (page: Parameters<typeof mockResponseBody>[0]['page']) => {
    await mockResponseBody({
        page,
        url: `**/${requestUrls.listingOptions}`,
        body: getSourceListingOptionsMock,
    });
    await mockResponseBody({page, url: `**/${requestUrls.dbNames}`, body: dbNamesMock});
    await mockResponseBody({page, url: `**/${requestUrls.getSources}`, body: getSourcesMock});
};

datalensTest.describe('Dataset sources listing', () => {
    datalensTest.afterEach(async ({page}) => {
        await page.unrouteAll({behavior: 'ignoreErrors'});
    });

    datalensTest('Should request sources with server pagination', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await setupMocks(page);

        const initialSourcesRequest = page.waitForRequest((request) => {
            return request.url().includes(`/${requestUrls.getSources}`);
        });

        await openTestPage(page, RobotChartsDatasetUrls.DatasetSourcesListing, {tab: 'sources'});

        const initialSourcesResult = await initialSourcesRequest;
        const initialSourcesBody = initialSourcesResult.postDataJSON();

        expect(initialSourcesBody.db_name).toBe(dbNamesMock.db_names[0]);
        expect(initialSourcesBody.limit).toBe(PAGINATION_LIMIT);

        const nextPageRequest = page.waitForRequest((request) => {
            const url = request.url();
            const postData = request.postDataJSON();
            return url.includes('/getSources') && postData.offset !== undefined;
        });

        const [nextPageResult] = await Promise.all([
            nextPageRequest,
            datasetPage.scrollSourcesList(),
        ]);
        const nextPageBody = nextPageResult.postDataJSON();

        expect(nextPageBody.offset).toBe(PAGINATION_OFFSET);
        expect(nextPageBody.db_name).toBe(dbNamesMock.db_names[0]);
        expect(nextPageBody.limit).toBe(PAGINATION_LIMIT);
    });

    datalensTest('Should not request sources when count < limit', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await mockResponseBody({
            page,
            url: `**/${requestUrls.listingOptions}`,
            body: getSourceListingOptionsMock,
        });
        await mockResponseBody({page, url: `**/${requestUrls.dbNames}`, body: dbNamesMock});

        let sourcesRequestCount = 0;
        await page.route(`**/${requestUrls.getSources}`, async (route) => {
            const body = getSourcesMock({length: PAGINATION_OFFSET});
            sourcesRequestCount++;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(body),
            });
        });

        await openTestPage(page, RobotChartsDatasetUrls.DatasetSourcesListing, {tab: 'sources'});

        await datasetPage.scrollSourcesList({scrollHeight: 1000});
        expect(sourcesRequestCount).toBe(1);

        await datasetPage.scrollSourcesList();
        expect(sourcesRequestCount).toBe(1);
    });

    datalensTest('Should reset offset when changing db_name', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await setupMocks(page);

        const initialRequest = page.waitForRequest((request) => {
            return request.url().includes('/getSources');
        });

        await openTestPage(page, RobotChartsDatasetUrls.DatasetSourcesListing, {
            tab: 'sources',
        });

        await page.waitForSelector(slct(AvatarQA.Avatar));
        await page.waitForSelector(slct(DatasetSourcesTableQa.Source));

        const initialRequestResult = await initialRequest;
        const initialRequestBody = initialRequestResult.postDataJSON();

        expect(initialRequestBody.db_name).toBe(dbNamesMock.db_names[0]);
        expect(initialRequestBody.limit).toBe(PAGINATION_LIMIT);

        const firstPageRequest = page.waitForRequest((request) => {
            return (
                request.url().includes('/getSources') && request.postDataJSON().offset !== undefined
            );
        });

        const [firstPageResult] = await Promise.all([
            firstPageRequest,
            datasetPage.scrollSourcesList(),
        ]);
        const firstPageBody = firstPageResult.postDataJSON();

        expect(firstPageBody.offset).toBe(PAGINATION_OFFSET);
        expect(firstPageBody.db_name).toBe(dbNamesMock.db_names[0]);
        expect(firstPageBody.limit).toBe(PAGINATION_LIMIT);

        const dbChangeRequest = page.waitForRequest((request) => {
            return (
                request.url().includes('/getSources') &&
                request.postDataJSON().db_name === dbNamesMock.db_names[2]
            );
        });

        const [dbChangeResult] = await Promise.all([
            dbChangeRequest,
            datasetPage.changeDbName({namePattern: dbNamesMock.db_names[2]}),
        ]);
        const dbChangeBody = dbChangeResult.postDataJSON();

        expect(dbChangeBody.offset).toBe(0);
        expect(dbChangeBody.db_name).toBe(dbNamesMock.db_names[2]);
        expect(dbChangeBody.limit).toBe(PAGINATION_LIMIT);
    });

    datalensTest('Should paginate with new db_name', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await setupMocks(page);

        await openTestPage(page, RobotChartsDatasetUrls.DatasetSourcesListing, {
            tab: 'sources',
        });

        await page.waitForSelector(slct(AvatarQA.Avatar));
        await page.waitForSelector(slct(DatasetSourcesTableQa.Source));

        const dbChangeRequest = page.waitForRequest((request) => {
            return (
                request.url().includes('/getSources') &&
                request.postDataJSON().db_name === dbNamesMock.db_names[2]
            );
        });

        const [dbChangeResult] = await Promise.all([
            dbChangeRequest,
            datasetPage.changeDbName({namePattern: dbNamesMock.db_names[2]}),
        ]);
        const dbChangeBody = dbChangeResult.postDataJSON();

        expect(dbChangeBody.offset).toBe(0);
        expect(dbChangeBody.db_name).toBe(dbNamesMock.db_names[2]);

        const paginationAfterDbChangeRequest = page.waitForRequest((request) => {
            const postData = request.postDataJSON();
            return (
                request.url().includes('/getSources') &&
                postData.offset === PAGINATION_OFFSET &&
                postData.db_name === dbNamesMock.db_names[2]
            );
        });

        const [paginationAfterDbChangeResult] = await Promise.all([
            paginationAfterDbChangeRequest,
            datasetPage.scrollSourcesList(),
        ]);
        const paginationAfterDbChangeBody = paginationAfterDbChangeResult.postDataJSON();

        expect(paginationAfterDbChangeBody.offset).toBe(PAGINATION_OFFSET);
        expect(paginationAfterDbChangeBody.db_name).toBe(dbNamesMock.db_names[2]);
        expect(paginationAfterDbChangeBody.limit).toBe(PAGINATION_LIMIT);
    });

    datalensTest.describe('Server search', () => {
        datalensTest('Should reset offset when searching', async ({page}) => {
            const datasetPage = new DatasetPage({page});
            await setupMocks(page);

            const initialRequest = page.waitForRequest((request) => {
                return request.url().includes('/getSources');
            });

            await openTestPage(page, RobotChartsDatasetUrls.DatasetSourcesListing, {
                tab: 'sources',
            });

            await page.waitForSelector(slct(AvatarQA.Avatar));
            await page.waitForSelector(slct(DatasetSourcesTableQa.Source));

            const initialRequestResult = await initialRequest;
            const initialRequestBody = initialRequestResult.postDataJSON();

            expect(initialRequestBody.db_name).toBe(dbNamesMock.db_names[0]);
            expect(initialRequestBody.limit).toBe(PAGINATION_LIMIT);

            const firstPageRequest = page.waitForRequest((request) => {
                return (
                    request.url().includes('/getSources') &&
                    request.postDataJSON().offset !== undefined
                );
            });

            const [firstPageResult] = await Promise.all([
                firstPageRequest,
                datasetPage.scrollSourcesList(),
            ]);
            const firstPageBody = firstPageResult.postDataJSON();

            expect(firstPageBody.offset).toBe(PAGINATION_OFFSET);
            expect(firstPageBody.db_name).toBe(dbNamesMock.db_names[0]);
            expect(firstPageBody.limit).toBe(PAGINATION_LIMIT);

            const searchRequest = page.waitForRequest((request) => {
                return (
                    request.url().includes('/getSources') &&
                    request.postDataJSON().search_text === SEARCH_VALUE
                );
            });

            const searchInput = await page.waitForSelector(
                slct(DatasetSourcesLeftPanelQA.SourcesServerSearchInput),
            );
            await searchInput.click();
            await searchInput.type(SEARCH_VALUE);

            const searchRequestResult = await searchRequest;
            const searchRequestBody = searchRequestResult.postDataJSON();

            expect(searchRequestBody.offset).toBe(0);
            expect(searchRequestBody.search_text).toBe(SEARCH_VALUE);
            expect(searchRequestBody.limit).toBe(PAGINATION_LIMIT);
        });

        datalensTest('Should paginate with search filter', async ({page}) => {
            const datasetPage = new DatasetPage({page});
            await setupMocks(page);

            await openTestPage(page, RobotChartsDatasetUrls.DatasetSourcesListing, {
                tab: 'sources',
            });

            await page.waitForSelector(slct(AvatarQA.Avatar));
            await page.waitForSelector(slct(DatasetSourcesTableQa.Source));

            const searchRequest = page.waitForRequest((request) => {
                return (
                    request.url().includes('/getSources') &&
                    request.postDataJSON().search_text === SEARCH_VALUE
                );
            });

            const searchInput = await page.waitForSelector(
                slct(DatasetSourcesLeftPanelQA.SourcesServerSearchInput),
            );
            await searchInput.click();
            await searchInput.type(SEARCH_VALUE);

            const searchRequestResult = await searchRequest;
            const searchRequestBody = searchRequestResult.postDataJSON();

            expect(searchRequestBody.offset).toBe(0);
            expect(searchRequestBody.search_text).toBe(SEARCH_VALUE);

            const paginationWithSearchRequest = page.waitForRequest((request) => {
                const postData = request.postDataJSON();
                return (
                    request.url().includes('/getSources') &&
                    postData.offset === PAGINATION_OFFSET &&
                    postData.search_text === SEARCH_VALUE
                );
            });

            const [paginationWithSearchResult] = await Promise.all([
                paginationWithSearchRequest,
                datasetPage.scrollSourcesList(),
            ]);
            const paginationWithSearchBody = paginationWithSearchResult.postDataJSON();

            expect(paginationWithSearchBody.offset).toBe(PAGINATION_OFFSET);
            expect(paginationWithSearchBody.search_text).toBe(SEARCH_VALUE);
            expect(paginationWithSearchBody.limit).toBe(PAGINATION_LIMIT);
        });
    });
});
