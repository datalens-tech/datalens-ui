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

datalensTest.describe('Dataset sources listing', () => {
    datalensTest('Should request sources with server pagination', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await mockResponseBody({
            page,
            url: `**/${requestUrls.listingOptions}`,
            body: getSourceListingOptionsMock,
        });
        await mockResponseBody({page, url: `**/${requestUrls.dbNames}`, body: dbNamesMock});
        await mockResponseBody({page, url: `**/${requestUrls.getSources}`, body: getSourcesMock});
        const sourcesRequest = page.waitForRequest((request) => {
            return request.url().includes(`/${requestUrls.getSources}`);
        });

        await openTestPage(page, RobotChartsDatasetUrls.DatasetSourcesListing, {tab: 'sources'});

        const sourcesResult = await sourcesRequest;
        const sourcesResultBody = sourcesResult.postDataJSON();

        expect(sourcesResultBody.db_name).toBe(dbNamesMock.db_names[0]);
        expect(sourcesResultBody.limit).toBe(101);

        const paginationRequest = page.waitForRequest((request) => {
            const url = request.url();
            const postData = request.postDataJSON();
            return url.includes('/getSources') && postData.offset !== undefined;
        });

        await datasetPage.scrollSourcesList();
        const paginationRequestResult = await paginationRequest;
        const paginationRequestBody = paginationRequestResult.postDataJSON();

        expect(paginationRequestBody.offset).toBe(100);
        expect(paginationRequestBody.db_name).toBe(dbNamesMock.db_names[0]);
        expect(paginationRequestBody.limit).toBe(101);
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
            const body = getSourcesMock({length: 100});
            sourcesRequestCount++;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(body),
            });
        });

        await openTestPage(page, RobotChartsDatasetUrls.DatasetSourcesListing, {tab: 'sources'});

        // Do not request until scroll end
        await datasetPage.scrollSourcesList({scrollHeight: 1000});
        expect(sourcesRequestCount).toBe(1);

        await datasetPage.scrollSourcesList();
        expect(sourcesRequestCount).toBe(1);
    });

    datalensTest('Should request sources with another db name', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await mockResponseBody({
            page,
            url: `**/${requestUrls.listingOptions}`,
            body: getSourceListingOptionsMock,
        });
        await mockResponseBody({page, url: `**/${requestUrls.dbNames}`, body: dbNamesMock});
        await mockResponseBody({page, url: `**/${requestUrls.getSources}`, body: getSourcesMock});
        const initialRequest = page.waitForRequest((request) => {
            return request.url().includes('/getSources');
        });

        await openTestPage(page, RobotChartsDatasetUrls.DatasetSourcesListing, {tab: 'sources'});

        await page.waitForSelector(slct(AvatarQA.Avatar));
        await page.waitForSelector(slct(DatasetSourcesTableQa.Source));
        const initialRequestResult = await initialRequest;
        const initialRequestBody = initialRequestResult.postDataJSON();

        expect(initialRequestBody.db_name).toBe(dbNamesMock.db_names[0]);
        expect(initialRequestBody.limit).toBe(101);

        const paginationRequest = page.waitForRequest((request) => {
            return (
                request.url().includes('/getSources') && request.postDataJSON().offset !== undefined
            );
        });
        await datasetPage.scrollSourcesList();

        const paginationRequestResult = await paginationRequest;
        const paginationRequestBody = paginationRequestResult.postDataJSON();

        expect(paginationRequestBody.offset).toBe(100);
        expect(paginationRequestBody.db_name).toBe(dbNamesMock.db_names[0]);
        expect(paginationRequestBody.limit).toBe(101);

        const newDbNameRequest = page.waitForRequest((request) => {
            return (
                request.url().includes('/getSources') &&
                request.postDataJSON().db_name === dbNamesMock.db_names[2]
            );
        });

        await datasetPage.changeDbName({namePattern: dbNamesMock.db_names[2]});

        const newDbNameRequestResult = await newDbNameRequest;
        const newDbNameRequestBody = newDbNameRequestResult.postDataJSON();

        expect(newDbNameRequestBody.offset).toBe(0);
        expect(newDbNameRequestBody.db_name).toBe(dbNamesMock.db_names[2]);
        expect(newDbNameRequestBody.limit).toBe(101);

        const paginationRequest2 = page.waitForRequest((request) => {
            return (
                request.url().includes('/getSources') &&
                request.postDataJSON().offset === 100 &&
                request.postDataJSON().db_name === dbNamesMock.db_names[2]
            );
        });
        await datasetPage.scrollSourcesList();

        const paginationRequestResult2 = await paginationRequest2;
        const paginationRequestBody2 = paginationRequestResult2.postDataJSON();

        expect(paginationRequestBody2.offset).toBe(100);
        expect(paginationRequestBody2.db_name).toBe(dbNamesMock.db_names[2]);
        expect(paginationRequestBody2.limit).toBe(101);
    });

    datalensTest('Should request sources with server search', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await mockResponseBody({
            page,
            url: `**/${requestUrls.listingOptions}`,
            body: getSourceListingOptionsMock,
        });
        await mockResponseBody({page, url: `**/${requestUrls.dbNames}`, body: dbNamesMock});
        await mockResponseBody({page, url: `**/${requestUrls.getSources}`, body: getSourcesMock});
        const initialRequest = page.waitForRequest((request) => {
            return request.url().includes('/getSources');
        });

        await openTestPage(page, RobotChartsDatasetUrls.DatasetSourcesListing, {tab: 'sources'});

        await page.waitForSelector(slct(AvatarQA.Avatar));
        await page.waitForSelector(slct(DatasetSourcesTableQa.Source));
        const initialRequestResult = await initialRequest;
        const initialRequestBody = initialRequestResult.postDataJSON();

        expect(initialRequestBody.db_name).toBe(dbNamesMock.db_names[0]);
        expect(initialRequestBody.limit).toBe(101);

        const paginationRequest = page.waitForRequest((request) => {
            return (
                request.url().includes('/getSources') && request.postDataJSON().offset !== undefined
            );
        });
        await datasetPage.scrollSourcesList();

        const paginationRequestResult = await paginationRequest;

        const paginationRequestBody = paginationRequestResult.postDataJSON();

        expect(paginationRequestBody.offset).toBe(100);
        expect(paginationRequestBody.db_name).toBe(dbNamesMock.db_names[0]);
        expect(paginationRequestBody.limit).toBe(101);

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
        expect(searchRequestBody.limit).toBe(101);

        const paginationRequest2 = page.waitForRequest((request) => {
            return (
                request.url().includes('/getSources') &&
                request.postDataJSON().offset === 100 &&
                request.postDataJSON().search_text === SEARCH_VALUE
            );
        });
        await datasetPage.scrollSourcesList();

        const paginationRequestResult2 = await paginationRequest2;
        const paginationRequestBody2 = paginationRequestResult2.postDataJSON();

        expect(paginationRequestBody2.offset).toBe(100);
        expect(paginationRequestBody2.search_text).toBe(SEARCH_VALUE);
        expect(paginationRequestBody2.limit).toBe(101);
    });
});
