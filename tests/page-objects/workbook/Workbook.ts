import {Page} from '@playwright/test';
import {DialogCreateEntry} from './DialogCreateEntry';
import {CreateEntryButton} from './CreateEntryButton';
import {NavigationMinimalPopup} from './NavigationMinimalPopup';
import {openTestPage, slct} from '../../utils';
import {WorkbooksUrls} from '../../constants/constants';
import {EditEntityButton} from './EditEntityButton';
import DashboardPage from '../../page-objects/dashboard/DashboardPage';
import {WorkbookPageQa} from '../../../src/shared/constants/qa/workbooks';
import {FiltersPO} from './Filters';

export class Workbook {
    createEntryButton: CreateEntryButton;
    dialogCreateEntry: DialogCreateEntry;
    navigationMinimalPopup: NavigationMinimalPopup;
    editEntityButton: EditEntityButton;

    dashboardPage: DashboardPage;

    protected page: Page;
    private readonly root = '.dl-collections-navigation-layout';

    constructor(page: Page) {
        this.page = page;
        this.dialogCreateEntry = new DialogCreateEntry(page);
        this.createEntryButton = new CreateEntryButton(page);
        this.navigationMinimalPopup = new NavigationMinimalPopup(page);
        this.editEntityButton = new EditEntityButton(page);
        this.dashboardPage = new DashboardPage({page});
    }

    get filters() {
        return new FiltersPO({page: this.page, parent: this.root});
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
}
