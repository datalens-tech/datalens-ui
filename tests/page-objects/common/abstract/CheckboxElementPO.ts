import {ElementPO} from './ElementPO';

export class CheckboxElementPO extends ElementPO {
    async toggle(enabled?: boolean) {
        const showFieldCheckbox = await this.page.waitForSelector(`${this.getSelector()} input`);

        if (enabled === undefined) {
            await showFieldCheckbox.click();
            return;
        }

        const showFieldCheckboxChecked = await showFieldCheckbox.isChecked();
        if (showFieldCheckboxChecked !== enabled) {
            await showFieldCheckbox.click();
        }
    }
}
