import {
    Browser,
    BrowserContext,
    BrowserContextOptions,
    LaunchOptions,
    Page,
} from '@playwright/test';
export type BrowserName = 'chromium' | 'firefox' | 'webkit';
export type DynamicTitle = string | ((browserType: BrowserName, cfg: SuiteConfig) => string);
export type NetworkState = 'domcontentloaded' | 'load' | 'networkidle';
export type TestGlobalsArgs = {
    page: Page;
    context: BrowserContext;
    browser: Browser;
};

export interface TestSuite {
    skip?: boolean;
    only?: boolean;
    title: DynamicTitle;
    func: (args: TestGlobalsArgs, config: SuiteConfig) => void;
    waitUntil?: NetworkState;
}

export interface SuiteConfig {
    title: DynamicTitle;
    browserList: BrowserName[];
    pageTimeout: number;
    browserOptions: LaunchOptions;
    browserContextOptions?: BrowserContextOptions;
    baseUrl: string;
    auth?: {
        url: string;
        login: string;
        password: string;
    };
    tests: TestSuite[];
    breakAfterFail?: boolean;
    beforeAll?: (browser: Browser, context: BrowserContext) => void;
    afterAuth?: (browser: Browser, context: BrowserContext) => void;
    afterAll?: (page: Page, browser: Browser, context: BrowserContext) => void;
    beforeEach?: (page: Page, browser: Browser, context: BrowserContext) => void;
    afterEach?: (page: Page, browser: Browser, context: BrowserContext) => void;
    only?: boolean;
    skip?: boolean;
    waitUntil?: NetworkState;
    pageInitScript?:
        | Function
        | string
        | {
              path?: string;
              content?: string;
          };
    pageInitScriptArg?: Object;
}

export interface SuiteOptions {
    screenPath?: string;
}

export type AuthRobotSettings = {
    login: string;
    password: string;
    url?: string;
    baseUrl?: string;
};

export type AuthenticateType = 'datalens' | 'passport' | 'custom';
export type AuthenticateCustomArgs = {
    page: Page;
    login?: string;
    password?: string;
    baseUrl?: string;
    storageState?: string;
};

export type AuthenticateArgs = {
    page: Page;
    baseUrl: string;
    authType: AuthenticateType;
    login: string;
    password: string;
    retryCount: number;
    afterAuth?: (args: {page: Page}) => Promise<void>;
    customAuth?: (args: AuthenticateCustomArgs) => Promise<void>;
    force?: boolean;
    authUrl?: string;
    storageState?: string;
};

export type AuthenticateCheckArgs = Pick<
    AuthenticateArgs,
    'page' | 'baseUrl' | 'authUrl' | 'authType'
>;
export type AuthenticateLoginArgs = Pick<
    AuthenticateArgs,
    'page' | 'baseUrl' | 'authUrl' | 'login' | 'password'
>;
