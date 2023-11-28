import {Page} from '@playwright/test';
import {DialogCreateEntry} from './DialogCreateEntry';
import {CreateEntryButton} from './CreateEntryButton';
import {NavigationMinimalPopup} from './NavigationMinimalPopup';

export class Workbook {
    createEntryButton: CreateEntryButton;
    dialogCreateEntry: DialogCreateEntry;
    navigationMinimalPopup: NavigationMinimalPopup;

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
        this.dialogCreateEntry = new DialogCreateEntry(page);
        this.createEntryButton = new CreateEntryButton(page);
        this.navigationMinimalPopup = new NavigationMinimalPopup(page);
    }
}
