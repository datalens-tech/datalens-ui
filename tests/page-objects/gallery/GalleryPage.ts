import {BasePage} from '../BasePage';
import {Workbook} from '../workbook/Workbook';
import type {BasePageProps} from '../BasePage';

import ImportDropdown from './ImportDropdown';

type GalleryPageProps = BasePageProps;

class GalleryPage extends BasePage {
    importDropdown: ImportDropdown;
    workbookPage: Workbook;

    constructor({page}: GalleryPageProps) {
        super({page});

        this.importDropdown = new ImportDropdown(page);
        this.workbookPage = new Workbook(page);
    }
}

export default GalleryPage;
