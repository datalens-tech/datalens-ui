import {Page} from '@playwright/test';
import {DialogCreateEntry} from './DialogCreateEntry';
import {CreateEntryButton} from './CreateEntryButton';
import {NavigationMinimalPopup} from './NavigationMinimalPopup';
import {openTestPage} from 'utils';
import {WorkbooksUrls} from 'constants/constants';
import {EditEntityButton} from './EditEntityButton';
import DashboardPage from 'page-objects/dashboard/DashboardPage';

export class Workbook {
    createEntryButton: CreateEntryButton;
    dialogCreateEntry: DialogCreateEntry;
    navigationMinimalPopup: NavigationMinimalPopup;
    editEntityButton: EditEntityButton;

    dashboardPage: DashboardPage;

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
        this.dialogCreateEntry = new DialogCreateEntry(page);
        this.createEntryButton = new CreateEntryButton(page);
        this.navigationMinimalPopup = new NavigationMinimalPopup(page);
        this.editEntityButton = new EditEntityButton(page);
        this.dashboardPage = new DashboardPage({page});
    }

    async openE2EWorkbookPage() {
        await openTestPage(this.page, WorkbooksUrls.E2EWorkbook);
    }

    async createDashboard({editDash}: {editDash: () => Promise<void>}) {
        await this.createEntryButton.createDashboard();

        await editDash();

        await this.dashboardPage.clickSaveButton();
        await this.dialogCreateEntry.createEntryWithName();
        await this.editEntityButton.waitForVisible();

        // Important: reload the page because dash state may be different for POST(create) and GET requests.
        this.page.reload();
    }
}
