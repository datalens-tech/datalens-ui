import {Page} from '@playwright/test';

import {WorkbookPageQa} from '../../../src/shared/constants/qa/workbooks';
import {openTestPage, slct} from '../../utils';
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

export class Workbook {
    actionsMoreDropdown: ActionsMoreDropdown;
    createEntryButton: CreateEntryButton;
    dashboardPage: DashboardPage;
    dialogCreateEntry: DialogCreateEntry;
    dialogDeleteWorkbook: DialogDeleteWorkbook;
    dialogWorkbook: DialogWorkbook;
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
