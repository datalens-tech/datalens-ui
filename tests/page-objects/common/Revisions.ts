import {Page} from '@playwright/test';

import {clickDropDownOption, cssSlct, slct, waitForCondition} from '../../utils';
import {COMMON_SELECTORS} from '../../utils/constants';
import {ActionPanelEntryContextMenuQa} from '../../../src/shared/constants/qa/action-panel';
import {DashRevisions, DialogConfirmQA, RevisionsPanelQa} from '../../../src/shared';

const REVISIONS_LOAD_TIMEOUT = 2000;

export default class Revisions {
    static selectors = {
        qa: {
            listRow: slct(COMMON_SELECTORS.REVISIONS_LIST_ROW),
        },
    };
    static getUrlRevIdParam(page: Page): string | null {
        const pageURL = new URL(page.url());
        // so far, it is not possible to use a common constant from the 'ui' before updating playwright
        // switch to a constant after CHARTS-5226
        return pageURL.searchParams.get('revId');
    }

    page: Page;
    private showRevisionsActionPanelButtonQa = 'action-open-revisions';

    constructor(page: Page) {
        this.page = page;
    }

    async openList() {
        // click on the ellipsis in the upper panel
        await this.page.click(slct(COMMON_SELECTORS.ENTRY_PANEL_MORE_BTN));
        await this.page.waitForSelector(cssSlct(COMMON_SELECTORS.ENTRY_CONTEXT_MENU_KEY));

        // select the item Change History
        await clickDropDownOption(this.page, ActionPanelEntryContextMenuQa.Revisions);
        await this.page.waitForSelector(slct(DashRevisions.EXPANDABLE_PANEL));

        // waiting for the revision list to be uploaded
        await this.page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST));
        await this.page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));
    }

    async openActualVersion() {
        try {
            await this.page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW), {
                timeout: REVISIONS_LOAD_TIMEOUT,
            });
        } catch {
            // the revision list is hidden, you need to open
            await this.openList();
        }
        await this.page.click(`.${COMMON_SELECTORS.REVISIONS_LIST_ROW_ACTUAL}`);
    }

    async openDraft() {
        try {
            await this.page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW), {
                timeout: REVISIONS_LOAD_TIMEOUT,
            });
        } catch {
            // the revision list is hidden, you need to open
            await this.openList();
        }
        const draftSelector = `.${COMMON_SELECTORS.REVISIONS_LIST_ROW_DRAFT}:not(.${COMMON_SELECTORS.REVISIONS_LIST_ROW_ACTUAL})`;
        await this.page.click(draftSelector);
    }

    async getRevisions() {
        return this.page.$$(slct('revisions-list-row'));
    }

    async makeRevisionActual() {
        await this.page.click(slct('action-make-actual'));

        await this.page.waitForSelector(slct(DialogConfirmQA.Dialog));

        await this.page.click(
            `${slct(DialogConfirmQA.Dialog)} ${slct(DialogConfirmQA.ApplyButton)}`,
        );
    }

    async validateRevisions(expectedNumber: number) {
        let revisions = [];
        await waitForCondition(async () => {
            const revisionList = await this.page.$(slct('expandable-panel'));
            if (!revisionList) {
                await this.openList();
            }
            revisions = await this.getRevisions();
            return revisions.length === expectedNumber;
        }).catch(() => {
            throw new Error(
                `Expected ${expectedNumber} of revisions in the list, but in fact ${revisions.length}`,
            );
        });
    }

    async getRevisionIdFromUrl() {
        return this.page.evaluate(() => {
            const searchParams = new URLSearchParams(window.location.search);

            return searchParams.get('revId');
        });
    }

    async waitUntilRevisionPanelDisappear() {
        return await waitForCondition(async () => {
            return !(await this.page.$(slct(RevisionsPanelQa.RevisionsPanel)));
        });
    }

    async openActualRevision() {
        await this.page.click(slct('action-open-actual'));
    }

    async openRevisionsListByRevisionsPanelControl() {
        await this.page.click(slct(this.showRevisionsActionPanelButtonQa));
    }

    getRevisionByIdx(idx: number) {
        return this.page.locator(Revisions.selectors.qa.listRow).nth(idx);
    }

    async getRevisionIdByIdx(idx: number) {
        return await this.getRevisionByIdx(idx).getAttribute('data-qa-revid');
    }
}
