import {
    ActionPanelQA,
    ConnectionsActionPanelControls,
    ConnectionsBaseQA,
    ConnectionsS3BaseQA,
    ConnectionsYadocsQA,
    DialogCreateWorkbookEntryQa,
    EntryDialogQA,
} from '../../../src/shared/constants';
import {ActionPanelEntryContextMenuQa} from '../../../src/shared/constants/qa/action-panel';
import {v1 as uuidv1} from 'uuid';

import {slct, waitForCondition} from '../../utils';
import {BasePage} from '../BasePage';
import type {BasePageProps} from '../BasePage';
import type {ConsoleMessage, Request} from '@playwright/test';
import Revisions from '../common/Revisions';

type ConnectionsPageProps = BasePageProps;
type FillInputArgs = {name: string; value: string};
type FillFormInputArgs = {id: 'input'} & FillInputArgs;

class ConnectionsPage extends BasePage {
    revisions: Revisions;

    private createQlChartButtonSelector = slct(
        ConnectionsActionPanelControls.CREATE_QL_CHART_BUTTON,
    );

    constructor({page}: ConnectionsPageProps) {
        super({page});
        this.revisions = new Revisions(page);
    }

    async createQlChart() {
        await this.page.click(this.createQlChartButtonSelector);
    }

    async fillCreateConnectionInFolder({name}: {name: string}) {
        const textInput = this.page.locator(slct(EntryDialogQA.PathSelect)).locator('input');
        // type connection name
        await textInput.fill(name);

        // create connection
        await this.page.locator(slct(EntryDialogQA.Apply)).click();
        try {
            await this.page.waitForURL(() => this.page.url().includes(name));
        } catch {
            throw new Error("Connection wasn't created");
        }
    }

    async createConnectionInFolder({name = uuidv1()}: {name?: string} = {}) {
        // open creation dialog
        await this.page.locator(slct(ConnectionsBaseQA.SUBMIT_ACTION_BUTTON)).click();

        await this.fillCreateConnectionInFolder({name});
    }

    async createConnectionInWorkbook({name = uuidv1()}: {name?: string} = {}) {
        const formSubmit = await this.page.waitForSelector(
            slct(ConnectionsBaseQA.SUBMIT_ACTION_BUTTON),
        );
        // open creation dialog
        await formSubmit.click();
        const textInput = this.page
            .locator(slct(DialogCreateWorkbookEntryQa.Input))
            .locator('input');
        // clear input
        await textInput.press('Meta+A');
        await textInput.press('Backspace');
        // type connection name
        await textInput.fill(name);
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

    getFieldSelector(name: string) {
        return `conn-input-${name}`;
    }

    async fillInput({name, value}: {name: string; value: string}) {
        const selector = this.getFieldSelector(name);
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

    async fillAndSubmitAddYadocDialog(fileUrl: string) {
        const fileInput = await this.page.waitForSelector(
            `${slct(ConnectionsYadocsQA.ADD_DOCUMENT_DIALOG_INPUT)} input`,
        );
        await fileInput.click();
        await fileInput.fill(fileUrl);
        const addFileDialogSubmitButton = await this.page.waitForSelector(
            slct(ConnectionsYadocsQA.ADD_DOCUMENT_DIALOG_SUBMIT_BUTTON),
        );
        await addFileDialogSubmitButton.click();
    }

    async applyS3SourceDialogAndForSourcesUpdating() {
        const updateFileSourceRequests: Request[] = [];
        this.page.on('request', (request) => {
            if (request.url().includes('updateFileSource')) {
                updateFileSourceRequests.push(request);
            }
        });
        const submitButton = await this.page.waitForSelector(
            slct(ConnectionsS3BaseQA.S3_SOURCE_DIALOG_SUBMIT_BUTTON),
        );
        await submitButton.click();
        await Promise.all(
            updateFileSourceRequests.map(async (request) => {
                const response = await request.response();
                expect(response?.status()).toBe(200);
            }),
        );
    }

    async saveUpdatedConnection() {
        await this.page.locator(slct(ConnectionsBaseQA.SUBMIT_ACTION_BUTTON)).click();
    }

    async removeConnection() {
        const moreButton = this.page.locator(slct(ActionPanelQA.MoreBtn));
        expect(moreButton).toBeVisible();
        await moreButton.click();

        const menuItemRemove = this.page
            .locator(slct(ActionPanelEntryContextMenuQa.Menu))
            .locator(slct(ActionPanelEntryContextMenuQa.Remove));
        expect(menuItemRemove).toBeVisible();
        await menuItemRemove.click();

        const applyButton = this.page.locator(slct(EntryDialogQA.Apply));
        expect(applyButton).toBeVisible();

        await applyButton.click();
    }
}

export default ConnectionsPage;
