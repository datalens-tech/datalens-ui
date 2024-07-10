import {ElementPO} from './ElementPO';

export class CheckboxElementPO extends ElementPO {
    async toggle(enabled?: boolean) {
        await this.getLocator().setChecked(Boolean(enabled));
    }
}
