import {ElementPO} from './ElementPO';

export class RadioGroupElementPO extends ElementPO {
    async selectByName(name: string) {
        await this.expectVisible();
        await this.page.locator(`${this.getSelector()} input[value="${name}"]`).click();
    }
}
