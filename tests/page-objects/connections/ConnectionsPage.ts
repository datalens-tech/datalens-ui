import {
    ConnectionsActionPanelControls,
    ConnectionsBaseQA,
    DialogCreateWorkbookEntryQa,
    EntryDialogQA,
} from '../../../src/shared/constants';
import {v1 as uuidv1} from 'uuid';

import {slct, waitForCondition} from '../../utils';
import {BasePage} from '../BasePage';
import type {BasePageProps} from '../BasePage';
import type {ConsoleMessage} from '@playwright/test';

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

    async fillCreateConnectionInFolder({name}: {name: string}) {
        const textInput = await this.page.waitForSelector(slct(EntryDialogQA.PathSelect));
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

    async createConnectionInFolder({name = uuidv1()}: {name?: string} = {}) {
        const formSubmit = await this.page.waitForSelector(
            slct(ConnectionsBaseQA.SUBMIT_ACTION_BUTTON),
        );
        // open creation dialog
        await formSubmit.click();

        await this.fillCreateConnectionInFolder({name});
    }

    async createConnectionInWorkbook({name = uuidv1()}: {name?: string} = {}) {
        const formSubmit = await this.page.waitForSelector(
            slct(ConnectionsBaseQA.SUBMIT_ACTION_BUTTON),
        );
        // open creation dialog
        await formSubmit.click();
        const textInput = await this.page.waitForSelector(slct(DialogCreateWorkbookEntryQa.Input));
        // clear input
        await textInput.press('Meta+A');
        await textInput.press('Backspace');
        // type connection name
        await textInput.type(name);
        const dialogApplyButton = await this.page.waitForSelector(
            slct(DialogCreateWorkbookEntryQa.ApplyButton),
        );
        // create connection
        await dialogApplyButton.click();
        try {
            await this.page.waitForURL(() => {
                return this.page.url().includes(name);
            });
        } catch {
            throw new Error("Connection wasn't created");
        }
    }

    async checkClientValidationErrors() {
        let hasValidationErrors = false;
        const onConsoleLog = (msg: ConsoleMessage) => {
            if (msg.text().includes('Validation errors')) {
                hasValidationErrors = true;
            }
        };
        this.page.on('console', onConsoleLog);
        const formSubmit = await this.page.waitForSelector(
            slct(ConnectionsBaseQA.SUBMIT_ACTION_BUTTON),
        );
        await formSubmit.click();
        await waitForCondition(async () => {
            return hasValidationErrors;
        });
        this.page.off('console', onConsoleLog);
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
