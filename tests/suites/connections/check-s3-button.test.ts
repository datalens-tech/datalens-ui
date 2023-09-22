import {Page} from '@playwright/test';
import {ConnectionsBaseQA, ConnectorType} from '../../../src/shared/constants';

import ConnectionsPage from '../../page-objects/connections/ConnectionsPage';
import {openTestPage, slct} from '../../utils';
import datalensTest from '../../utils/playwright/globalTestDefinition';

datalensTest.describe('Connections page', () => {
    datalensTest(
        'Check creation button visibility in case of S3 based connector form',
        async ({page}: {page: Page}) => {
            const connectionsPage = new ConnectionsPage({page});
            const CONN_TYPES = [ConnectorType.File /*ConnectorType.GsheetsV2*/];

            const checkButtonVisibility = async (type: string) => {
                await openTestPage(page, `/connections/new/${type}`);
                await connectionsPage.waitForSelector(slct(ConnectionsBaseQA.S3_ACTION_BUTTON));
            };

            for (const type of CONN_TYPES) {
                await checkButtonVisibility(type);
            }
        },
    );
});
