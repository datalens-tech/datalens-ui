import {Page} from '@playwright/test';
import {VALIDATE_DATASET_URL} from './constants';

export const getValidatePromise = (page: Page) =>
    page.waitForResponse((response) => response.url().includes(VALIDATE_DATASET_URL));
