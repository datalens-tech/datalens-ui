import dotenv from 'dotenv';
import os from 'os';
import path from 'path';

import {PlaywrightTestConfig, ReporterDescription, expect} from '@playwright/test';

import {DatalensTestFixtures} from './utils/playwright/globalTestDefinition';
import {isTrueArg} from '../src/shared';

const ROOT_ENV_PATH = path.resolve(__dirname, '..', '.env');

dotenv.config({path: ROOT_ENV_PATH});

let maxWorkers = process.env.E2E_MAX_WORKERS
    ? parseInt(process.env.E2E_MAX_WORKERS, 10)
    : os.cpus().length.toString();

if (process.env.CI === 'true') {
    maxWorkers = 6;
}

const testMatch = process.env.E2E_TEST_MATCH
    ? `**/${process.env.E2E_TEST_MATCH}.test.ts`
    : undefined;

const grep = process.env.E2E_TEST_NAME_PATTERN
    ? new RegExp(process.env.E2E_TEST_NAME_PATTERN)
    : undefined;

const grepInvert = process.env.E2E_TEST_NAME_PATTERN_INVERT
    ? process.env.E2E_TEST_NAME_PATTERN_INVERT.trim()
          .split('/[\n,]+/')
          .map((pattern) => new RegExp(pattern.trim()))
    : undefined;

const workers = process.env.E2E_DEBUG ? 1 : maxWorkers;

const retries = process.env.E2E_RETRY_TIMES ? Number(process.env.E2E_RETRY_TIMES) : 0;

const maxFailures = process.env.E2E_MAX_FAILURES ? parseInt(process.env.E2E_MAX_FAILURES, 10) : 0;

const headful = isTrueArg(process.env.E2E_HEADFUL);

const slowMo = Number.isInteger(Number(process.env.E2E_SLOW_MO))
    ? Number(process.env.E2E_SLOW_MO)
    : 100;

const reporter: ReporterDescription[] = [
    ['html', {outputFolder: 'artifacts/report', open: 'never'}],
    ['json', {outputFile: 'artifacts/results.json'}],
    ['list'],
];

const updateSnapshots = process.env.E2E_UPDATE_SNAPSHOTS === '1' ? 'all' : 'none';
const forbidOnly = process.env.E2E_FORBID_ONLY !== '0';

// While we are too lazy to add expect to each file.
Object.defineProperty(global, 'expect', {
    writable: false,
    value: expect,
});

const baseURL = process.env.E2E_DOMAIN;

const globalSetupPath = './utils/playwright/datalens/setup-e2e';

// eslint-disable-next-line no-console
console.log(`Base URL for tests is: ${baseURL}`);

const testTimeout = process.env.E2E_TEST_TIMEOUT
    ? parseInt(process.env.E2E_TEST_TIMEOUT, 10)
    : 60000 * 1.5;
const expectTimeout = process.env.E2E_EXPECT_TIMEOUT
    ? parseInt(process.env.E2E_EXPECT_TIMEOUT, 10)
    : testTimeout;
const actionTimeout = process.env.E2E_ACTION_TIMEOUT
    ? parseInt(process.env.E2E_ACTION_TIMEOUT, 10)
    : testTimeout;
const isAuthDisabled =
    isTrueArg(process.env.NO_AUTH) ||
    isTrueArg(process.env.E2E_NO_AUTH) ||
    !isTrueArg(process.env.AUTH_ENABLED || 'true');
const playwrightConfig: PlaywrightTestConfig<DatalensTestFixtures> = {
    workers,
    testMatch,
    retries,
    reporter,
    grep,
    grepInvert,
    fullyParallel: true,
    globalSetup: require.resolve(globalSetupPath),
    timeout: testTimeout,
    maxFailures,
    forbidOnly,
    snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
    updateSnapshots,
    outputDir: './test-results',
    expect: {
        timeout: expectTimeout,
    },
    use: {
        browserName: 'chromium',
        launchOptions: {
            slowMo,
        },
        headless: !headful,
        baseURL,
        ignoreHTTPSErrors: true,
        viewport: {width: 1920, height: 1080},
        trace: {mode: 'on-first-retry', screenshots: false, sources: false},
        actionTimeout: actionTimeout,
        testIdAttribute: 'data-qa',
        storageState: isAuthDisabled
            ? undefined
            : path.join(__dirname, 'artifacts/storageState.json'),
    },
    projects: [
        {
            name: 'basic',
            testDir: process.env.E2E_SUITE ? `./suites/${process.env.E2E_SUITE}` : './suites',
        },
        {
            name: 'opensource',
            testDir: process.env.E2E_SUITE
                ? `./opensource-suites/${process.env.E2E_SUITE}`
                : './opensource-suites',
        },
    ],
};

module.exports = playwrightConfig;
