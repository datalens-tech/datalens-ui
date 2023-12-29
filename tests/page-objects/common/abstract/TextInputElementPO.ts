import {ElementPO} from './ElementPO';

export class TextInputElementPO extends ElementPO {
    async fill(text: string) {
        await this.page.fill(`${this.getSelector()} input`, text);
    }
}
