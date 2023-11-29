import {Page} from '@playwright/test';
import {DialogCreateEntry} from './DialogCreateEntry';
import {CreateEntryButton} from './CreateEntryButton';
import {NavigationMinimalPopup} from './NavigationMinimalPopup';
import {openTestPage} from 'utils';
import {WorkbooksUrls} from 'constants/constants';
import {EditEntityButton} from './EditEntityButton';

export class Workbook {
    createEntryButton: CreateEntryButton;
    dialogCreateEntry: DialogCreateEntry;
    navigationMinimalPopup: NavigationMinimalPopup;
    editEntityButton: EditEntityButton;

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
        this.dialogCreateEntry = new DialogCreateEntry(page);
        this.createEntryButton = new CreateEntryButton(page);
        this.navigationMinimalPopup = new NavigationMinimalPopup(page);
        this.editEntityButton = new EditEntityButton(page);
    }

    async openE2EWorkbookPage() {
        await openTestPage(this.page, WorkbooksUrls.E2EWorkbook);
    }
}
