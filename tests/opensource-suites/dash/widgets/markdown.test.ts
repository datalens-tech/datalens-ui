import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const expectedHTML = `
<div class="dashkit-plugin-text dashkit-plugin-text_withMarkdown"><div class="yfm"><p>This text is highlighted <strong>in bold</strong>.</p>
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

const text = `This text is highlighted **in bold**.

This text is in *italics*.

* Element 1

* Element 2

* Element 3`;

datalensTest.describe('Dashboards - Markdown', () => {
    datalensTest('Markdown should turn into HTML tags', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.createDashboard({
            editDash: async () => {
                await dashboardPage.addText(text);
            },
        });

        const receivedHTML = await dashboardPage.getMarkdownHTML();
        const hasText = receivedHTML.trim().includes(expectedHTML.trim());
        expect(hasText).toBeTruthy();
    });
});
