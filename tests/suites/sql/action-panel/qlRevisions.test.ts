import {expect} from '@playwright/test';
import QLPage from '../../../page-objects/ql/QLPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsSQLEditorUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {RevisionsPanelQa} from '../../../../src/shared';

const sqlScript = `
select built_year, AVG(iznos::float)
from public.sample
where iznos::float > 0 and built_year > '2016'
group by built_year, iznos
order by built_year, iznos
`;

const sqlScript2 = `
select built_year, AVG(iznos::float)
from public.sample
where iznos::float > 0 AND built_year > '2015'
group by built_year, iznos
order by built_year, iznos
`;

const sqlScript3 = `
select built_year, AVG(iznos::float)
from public.sample
where iznos::float > 0 AND built_year > '2014'
group by built_year, iznos
order by built_year, iznos
`;

const CHART_RENDER_TIMEOUT = 60000;

datalensTest.describe('QL - saving when versioning charts', () => {
    datalensTest.beforeEach(async ({page}) => {
        const qlPage = new QLPage({page});

        await openTestPage(page, RobotChartsSQLEditorUrls.NewQLChartForPostgresDemo);

        await qlPage.setScript(sqlScript);

        await qlPage.runScript();

        const chart = qlPage.page.locator('.chartkit-graph');
        await expect(chart).toBeVisible({timeout: CHART_RENDER_TIMEOUT});

        const entryName = 'ql-revision-e2e-test-chart';

        await qlPage.saveQlEntry(qlPage.getUniqueEntryName(entryName));

        await qlPage.clearScript();

        await qlPage.setScript(sqlScript2);

        const apiRunSuccessfulPromise = qlPage.waitForSuccessfulResponse('/api/run');

        await qlPage.runScript();

        await apiRunSuccessfulPromise;

        await qlPage.saveExistentQlEntry();
    });

    datalensTest.afterEach(async ({page}, testInfo) => {
        if (testInfo.status !== 'failed' && testInfo.status !== 'timedOut') {
            const qlPage = new QLPage({page});

            await qlPage.deleteEntry();
        }
    });

    datalensTest(
        'When you click on make relevant, the version should not save the changes made on it',
        async ({page}) => {
            const qlPage = new QLPage({page});

            await qlPage.switchToQlInitialRevision(sqlScript);

            await qlPage.clearScript();

            await qlPage.setScript(sqlScript3);

            const apiRunSuccessfulPromise = qlPage.waitForSuccessfulResponse('/api/run');

            await qlPage.runScript();

            await apiRunSuccessfulPromise;

            await qlPage.revisions.makeRevisionActual();

            await waitForCondition(async () => {
                const currentScript = (await qlPage.getScript()) || '';

                return qlPage.compareScripts(sqlScript, currentScript);
            }).catch(() => {
                throw new Error(
                    'The editor should have a script that was in the revision, without changes',
                );
            });

            await qlPage.revisions.validateRevisions(3);
        },
    );

    datalensTest(
        'When you click "Save as Draft", a revision with all changes should be created',
        async ({page}) => {
            const qlPage = new QLPage({page});

            const apiRunSuccessfulPromise = qlPage.waitForSuccessfulResponse('/api/run');

            await qlPage.switchToQlInitialRevision(sqlScript);

            await apiRunSuccessfulPromise;

            await qlPage.clearScript();

            await qlPage.setScript(sqlScript3);

            const apiRunSuccessfulPromise2 = qlPage.waitForSuccessfulResponse('/api/run');

            await qlPage.runScript();

            await apiRunSuccessfulPromise2;

            await qlPage.saveExistentQlEntry();

            await waitForCondition(async () => {
                const currentScript = (await qlPage.getScript()) || '';

                const revisionPanel = await qlPage.page.$(slct(RevisionsPanelQa.RevisionsPanel));

                return qlPage.compareScripts(currentScript, sqlScript3) && revisionPanel;
            }).catch(() => {
                throw new Error('Failed to save draft correctly');
            });

            await qlPage.revisions.validateRevisions(3);
        },
    );

    datalensTest(
        'When you click make relevant, another revision should become relevant',
        async ({page}) => {
            const qlPage = new QLPage({page});

            const apiRunSuccessfulPromise = qlPage.waitForSuccessfulResponse('/api/run');

            await qlPage.switchToQlInitialRevision(sqlScript);

            await apiRunSuccessfulPromise;

            await qlPage.revisions.makeRevisionActual();

            await qlPage.revisions.waitUntilRevisionPanelDisappear();

            await qlPage.revisions.validateRevisions(3);

            const revId = await qlPage.revisions.getRevisionIdFromUrl();

            expect(revId).toBe(null);
        },
    );

    datalensTest(
        'When you click on the open current button, it opens the current version',
        async ({page}) => {
            const qlPage = new QLPage({page});

            const apiRunSuccessfulPromise = qlPage.waitForSuccessfulResponse('/api/run');

            await qlPage.switchToQlInitialRevision(sqlScript);

            await apiRunSuccessfulPromise;

            await qlPage.revisions.openActualRevision();

            await qlPage.revisions.waitUntilRevisionPanelDisappear();

            await qlPage.revisions.validateRevisions(2);

            await waitForCondition(async () => {
                const currentScript = (await qlPage.getScript()) || '';

                return qlPage.compareScripts(currentScript, sqlScript2);
            }).catch(() => {
                throw new Error('The chart revision switched, but the old chart was drawn');
            });

            const revId = await qlPage.revisions.getRevisionIdFromUrl();

            expect(revId).toBe(null);
        },
    );

    datalensTest('Save revision as new chart', async ({page, context}) => {
        const qlPage = new QLPage({page});

        const initialChartEntryId = qlPage.getEntryIdFromUrl() || undefined;

        expect(initialChartEntryId).not.toBe(undefined);

        const apiRunSuccessfulPromise = qlPage.waitForSuccessfulResponse('/api/run');

        await qlPage.switchToQlInitialRevision(sqlScript);

        await apiRunSuccessfulPromise;

        await qlPage.saveQlChartAsNew(qlPage.getUniqueEntryName('ql-e2e-revision-test'));

        // waiting for the render of the new entry before comparing urls
        await qlPage.revisions.waitUntilRevisionPanelDisappear();

        const newChartEntryId = qlPage.getEntryIdFromUrl() || undefined;

        expect(newChartEntryId).not.toBe(undefined);

        expect(initialChartEntryId).not.toEqual(newChartEntryId);

        await waitForCondition(async () => {
            const currentScript = (await qlPage.getScript()) || '';

            return qlPage.compareScripts(currentScript, sqlScript);
        }).catch(() => {
            throw new Error(
                `Saving the new chart was not successful. The script does not match the script from the first revision`,
            );
        });

        const secondPage = await context.newPage();

        await openTestPage(secondPage, `/ql/${initialChartEntryId}`);

        const chart = qlPage.page.locator('.chartkit-graph');
        await expect(chart).toBeVisible({timeout: CHART_RENDER_TIMEOUT});
    });
});
