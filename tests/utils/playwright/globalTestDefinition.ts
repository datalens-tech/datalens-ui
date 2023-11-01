import {test as baseTest} from '@playwright/test';

import {generateScreenshotName, makeScreen} from './utils';
import type {TestsParametrizationConfig} from '../../types/config';
import {config} from '../opensource/constants/config';

export type DatalensTestFixtures = {
    makeScreenshot: void;
    isSmokeTest: boolean;
    screenshotName?: string;

    config: TestsParametrizationConfig;
};

const datalensTest = baseTest.extend<DatalensTestFixtures>({
    // Inside playwright.smoke.config.ts setting this variable to true
    isSmokeTest: [false, {option: true}],
    // The name of the screenshot for smoke tests, determined at the smoke-config level
    screenshotName: '',
    // Automatically take a screenshot after running each test.
    makeScreenshot: [
        async ({page, isSmokeTest, screenshotName}, use, testInfo) => {
            // Calling the test
            await use();

            const configRetriesNumber = testInfo.config.projects[0].retries;

            // After calling the test, we check whether it was successful. If not, take a screenshot
            const isTestFailed = testInfo.status === 'failed' || testInfo.status === 'timedOut';
            const isAllRetriesPassed = isSmokeTest || testInfo.retry === configRetriesNumber;

            if (isTestFailed && isAllRetriesPassed) {
                // Screenshot name is used only in smoke tests
                // since the title is too long there because of the url to the entity in datalens
                // and nodejs crashes when trying to take a screenshot
                await makeScreen(page, generateScreenshotName(screenshotName || testInfo.title));
            }
        },
        {
            auto: true,
        },
    ],
    config: [config, {option: true}],
});

export default datalensTest;
