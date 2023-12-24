import {Page} from '@playwright/test';

export type ElementSelectors = {
    parent?: string;
    qa: {
        root: string;
    };
};

export type ElementPOProps = {
    page: Page;
    selectors: ElementSelectors;
};
