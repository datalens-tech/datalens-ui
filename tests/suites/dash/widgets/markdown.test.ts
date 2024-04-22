import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

const expectedHTML = `
<div class="dashkit-plugin-text dashkit-plugin-text_withMarkdown" data-plugin-root-el="text"><div class="yfm"><p>This text is highlighted <strong>in bold</strong>.</p>
<p>This text is in <em>italics</em>.</p>
<ul>
<li>
<p>Element 1</p>
</li>
<li>
<p>Element 2</p>
</li>
<li>
<p>Element 3</p>
</li>
</ul>
</div></div>
`;

datalensTest.describe('Dashboards - Markdown', () => {
    datalensTest('Markdown should turn into HTML tags', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await openTestPage(page, RobotChartsDashboardUrls.DashnboardWithMarkdown);

        const receivedHTML = await dashboardPage.getMarkdownHTML();
        const hasText = receivedHTML.trim().includes(expectedHTML.trim());
        expect(hasText).toBeTruthy();
    });
});
