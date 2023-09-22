import {
    ConnectionsActionPanelControls,
    ConnectionsBaseQA,
    EntryDialogQA,
} from '../../../src/shared/constants';
import uuid from 'uuid/v1';

import {slct} from '../../utils';
import {BasePage, BasePageProps} from '../BasePage';

type ConnectionsPageProps = BasePageProps;
type FillInputArgs = {name: string; value: string};
type FillFormInputArgs = {id: 'input'} & FillInputArgs;

class ConnectionsPage extends BasePage {
    private createQlChartButtonSelector = slct(
        ConnectionsActionPanelControls.CREATE_QL_CHART_BUTTON,
    );

    constructor({page}: ConnectionsPageProps) {
        super({page});
    }

    async createQlChart() {
        await this.page.click(this.createQlChartButtonSelector);
    }

    async createConnectionInFolder({name = uuid()}: {name?: string} = {}) {
        const formSubmit = await this.page.waitForSelector(
            slct(ConnectionsBaseQA.SUBMIT_ACTION_BUTTON),
        );
        // open creation dialog
        await formSubmit.click();
        const textInput = await this.page.waitForSelector(slct('path-select'));
        // type connection name
        await textInput.type(name);
        const dialogApplyButton = await this.page.waitForSelector(slct(EntryDialogQA.Apply));
        // create connection
        await dialogApplyButton.click();
        try {
            await this.page.waitForURL(() => this.page.url().includes(name));
        } catch {
            throw new Error("Connection wasn't created");
        }
    }

    async fillInput({name, value}: {name: string; value: string}) {
        const selector = `conn-input-${name}`;
        const input = await this.page.waitForSelector(slct(selector));
        // focus input
        await input.click();
        await input.type(value);
    }

    async fillForm(args: FillFormInputArgs[]) {
        for (const control of args) {
            const {id, name, value} = control;
            switch (id) {
                case 'input': {
                    await this.fillInput({name, value});
                    break;
                }
            }
        }
    }
}

export default ConnectionsPage;
