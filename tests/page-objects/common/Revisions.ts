import {Page} from '@playwright/test';

import {clickDropDownOption, cssSlct, slct, waitForCondition} from '../../utils';
import {COMMON_SELECTORS} from '../../utils/constants';
import {ActionPanelEntryContextMenuQa} from '../../../src/shared/constants/qa/action-panel';
import {
    DashRevisions,
    DialogConfirmQA,
    RevisionsListQa,
    RevisionsPanelQa,
} from '../../../src/shared';

const REVISIONS_LOAD_TIMEOUT = 2000;

export default class Revisions {
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
        const revisionList = await this.page.$(slct(RevisionsListQa.ExpandablePanel));

        if (revisionList) {
            return;
        }
        // click on the ellipsis in the upper panel
        await this.page.click(slct(COMMON_SELECTORS.ENTRY_PANEL_MORE_BTN));
        await this.page.waitForSelector(cssSlct(COMMON_SELECTORS.ENTRY_CONTEXT_MENU_KEY));

        // select the item Change History
        await clickDropDownOption(this.page, ActionPanelEntryContextMenuQa.Revisions);
        await this.page.waitForSelector(slct(DashRevisions.EXPANDABLE_PANEL));

        // waiting for the revision list to be uploaded
        await this.page.waitForSelector(slct(RevisionsListQa.List));
        await this.page.waitForSelector(slct(RevisionsListQa.RevisionsListRow));
    }

    async openActualVersion() {
        try {
            await this.page.waitForSelector(slct(RevisionsListQa.RevisionsListRow), {
                timeout: REVISIONS_LOAD_TIMEOUT,
            });
        } catch {
            // the revision list is hidden, you need to open
            await this.openList();
        }
        await this.page.click(slct(RevisionsListQa.RevisionsListRowActual));
    }

    async openDraft() {
        try {
            await this.page.waitForSelector(slct(RevisionsListQa.RevisionsListRow), {
                timeout: REVISIONS_LOAD_TIMEOUT,
            });
        } catch {
            // the revision list is hidden, you need to open
            await this.openList();
        }

        await this.page.click(slct(RevisionsListQa.RevisionsListRowDraft));
    }

    async openFirstNotActualVersion() {
        try {
            await this.page.waitForSelector(slct(RevisionsListQa.RevisionsListRow), {
                timeout: REVISIONS_LOAD_TIMEOUT,
            });
        } catch {
            // the revision list is hidden, you need to open
            await this.openList();
        }

        const firstNotActualRevision = await this.page
            .locator(slct(RevisionsListQa.RevisionsListRowNotActual))
            .first();
        await firstNotActualRevision.click();
    }

    async getRevisions() {
        return this.page.$$(slct(RevisionsListQa.RevisionsListRow));
    }

    async makeRevisionActual() {
        await this.page.click(slct(RevisionsPanelQa.ButtonMakeActual));

        await this.page.waitForSelector(slct(DialogConfirmQA.Dialog));

        await this.page.click(
            `${slct(DialogConfirmQA.Dialog)} ${slct(DialogConfirmQA.ApplyButton)}`,
        );
    }

    async validateRevisions(expectedNumber: number) {
        let revisions = [];
        await waitForCondition(async () => {
            await this.openList();

            revisions = await this.getRevisions();

            await expect(revisions).toHaveLength(expectedNumber);
        }).catch(() => {
            throw new Error(
                `Expected ${expectedNumber} of revisions in the list, but in fact ${revisions.length}`,
            );
        });
    }

    async checkRevisionsStatusCount({
        all,
        actual,
        draft,
        notActual,
    }: {
        all: number;
        actual?: number;
        draft?: number;
        notActual?: number;
    }) {
        await this.openList();

        const allRevisions = await this.getRevisions();
        const revisionsList = this.page.locator(slct(RevisionsListQa.List));

        await expect(allRevisions.length).toBe(all);

        if (actual) {
            const actualRevisionsCount = await revisionsList
                .locator(slct(RevisionsListQa.RevisionsListRowActual))
                .count();
            await expect(actualRevisionsCount).toBe(actual);
        }

        if (draft) {
            const draftRevisionsCount = await revisionsList
                .locator(slct(RevisionsListQa.RevisionsListRowDraft))
                .count();
            await expect(draftRevisionsCount).toBe(draft);
        }

        if (notActual) {
            const notActualRevisionsCount = await revisionsList
                .locator(slct(RevisionsListQa.RevisionsListRowNotActual))
                .count();

            await expect(notActualRevisionsCount).toBe(notActual);
        }
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
        await this.page.click(slct(RevisionsPanelQa.ButtonOpenActual));
    }

    async openRevisionsListByRevisionsPanelControl() {
        await this.page.click(slct(this.showRevisionsActionPanelButtonQa));
    }

    getRevisionByIdx(idx: number) {
        return this.page.locator(slct(RevisionsListQa.RevisionsListRow)).nth(idx);
    }

    async getRevisionIdByIdx(idx: number) {
        return await this.getRevisionByIdx(idx).getAttribute('data-qa-revid');
    }
}
