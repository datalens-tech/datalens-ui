import {Page} from '@playwright/test';

import {WorkbookPageQa} from '../../../src/shared/constants/qa/workbooks';
import {createSharedEntry, openTestPage, slct} from '../../utils';
import {WorkbooksUrls} from '../../constants/constants';
import DashboardPage from '../../page-objects/dashboard/DashboardPage';

import {ActionsMoreDropdown} from './ActionsMoreDropdown';
import {CreateEntryButton} from './CreateEntryButton';
import {DialogCreateEntry} from './DialogCreateEntry';
import {DialogDeleteWorkbook} from './DialogDeleteWorkbook';
import {DialogWorkbook} from './DialogWorkbook';
import {EditEntityButton} from './EditEntityButton';
import {FiltersPO} from './Filters';
import {NavigationMinimalPopup} from './NavigationMinimalPopup';
import {DialogCollectionStructure} from './DialogCollectionStructure';
import {
    DashEntryQa,
    EntryScope,
    SharedEntriesAddFromLinkDialogQa,
    SharedEntriesSelectDialogQa,
} from '../../../src/shared';

export class Workbook {
    actionsMoreDropdown: ActionsMoreDropdown;
    createEntryButton: CreateEntryButton;
    dashboardPage: DashboardPage;
    dialogCreateEntry: DialogCreateEntry;
    dialogDeleteWorkbook: DialogDeleteWorkbook;
    dialogWorkbook: DialogWorkbook;
    dialogCollectionStructure: DialogCollectionStructure;
    editEntityButton: EditEntityButton;
    navigationMinimalPopup: NavigationMinimalPopup;

    protected page: Page;
    private readonly root = '.dl-collections-navigation-layout';

    constructor(page: Page) {
        this.page = page;

        this.actionsMoreDropdown = new ActionsMoreDropdown(page);
        this.createEntryButton = new CreateEntryButton(page);
        this.dashboardPage = new DashboardPage({page});
        this.dialogCreateEntry = new DialogCreateEntry(page);
        this.dialogDeleteWorkbook = new DialogDeleteWorkbook(page);
        this.dialogWorkbook = new DialogWorkbook(page);
        this.editEntityButton = new EditEntityButton(page);
        this.navigationMinimalPopup = new NavigationMinimalPopup(page);
        this.dialogCollectionStructure = new DialogCollectionStructure(page);
    }

    get filters() {
        return new FiltersPO({page: this.page, parent: this.root});
    }

    async checkWorkbookPage() {
        await this.page.waitForSelector(slct(WorkbookPageQa.Layout));
    }

    async openE2EWorkbookPage() {
        await openTestPage(this.page, WorkbooksUrls.E2EWorkbook);
    }

    async openWorkbookItemMenu(dashId: string) {
        const listItem = this.page.locator(
            `${slct(WorkbookPageQa.ListItem)} ${slct(dashId.replace('/', ''))}`,
        );
        await listItem.focus();

        const menuDropDownBtn = listItem
            .locator('..')
            .locator(`${slct(WorkbookPageQa.MenuDropDownBtn)}`);

        await menuDropDownBtn.focus();
        await menuDropDownBtn.click();
    }

    async findFirstItemByScope(scope: string, isSharedEntry = false) {
        const chunk = isSharedEntry
            ? this.page.locator(slct(`${WorkbookPageQa.ChunkSharedEntryScope}${scope}`))
            : this.page.locator(slct(`${WorkbookPageQa.ChunkScope}${scope}`));

        return chunk.locator(slct(WorkbookPageQa.ListItem)).first();
    }

    async clickFirstDashboard() {
        const firstDashboard = await this.findFirstItemByScope('dash');

        const dashName = await firstDashboard
            .locator(slct(WorkbookPageQa.ListItemName))
            .textContent();

        await firstDashboard.click();

        // check that the dashboard has loaded by its name
        await this.page.waitForSelector(`${slct(DashEntryQa.EntryName)} >> text=${dashName}`);
    }

    async addSharedEntryFromLinkIntoWorkbook({
        scope,
        entryUrl,
    }: {
        scope: EntryScope.Dataset | EntryScope.Connection;
        entryUrl: string;
    }) {
        await this.createEntryButton.waitForVisible();
        await this.createEntryButton.click();
        await createSharedEntry({page: this.page, scope});
        const pasteLinkBtn = await this.page.waitForSelector(
            slct(SharedEntriesSelectDialogQa.PastLinkToEntryBtn),
        );
        await pasteLinkBtn.click();
        const textInput = this.page
            .locator(slct(SharedEntriesAddFromLinkDialogQa.LintTextInput))
            .locator('input');
        await textInput.press('Meta+A');
        await textInput.press('Backspace');
        await textInput.fill(entryUrl);
        const addLinkApplyBtn = this.page.locator(slct(SharedEntriesAddFromLinkDialogQa.ApplyBtn));
        await addLinkApplyBtn.click();
    }
}
