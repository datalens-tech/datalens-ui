import type {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {TextWidgetQa} from '../../../../src/shared';

const PARAMS_NAMES = {
    CUT: 'Cut',
    TAB_1: 'Tab 1',
    TAB_2: 'Tab 2',
};

const PARAMS_TEXT = {
    CUT: 'Cut content',
    TAB_1: 'Tab 1 content',
    TAB_2: 'Tab 2 content',
    MERMAID_NAME: 'Mermaid',
};

const PARAMS_CODE = {
    CUT: `{% cut "${PARAMS_NAMES.CUT}" %}

${PARAMS_TEXT.CUT}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam dictum maximus rutrum. Proin sagittis volutpat rutrum. Mauris vulputate justo vulputate, venenatis orci eu, efficitur nisl. Nulla dignissim rhoncus neque, eget tincidunt nisl maximus ut. Ut aliquam condimentum ex sit amet varius. Maecenas rhoncus pellentesque lacus, at bibendum erat feugiat eget. Cras eu tellus aliquam, tempus enim tempor, lobortis orci.

{% endcut %}`,
    TABS: `{% list tabs %}

- ${PARAMS_NAMES.TAB_1}

  ${PARAMS_TEXT.TAB_1}

- ${PARAMS_NAMES.TAB_2}

  ${PARAMS_TEXT.TAB_2}

  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam dictum maximus rutrum. Proin sagittis volutpat rutrum. Mauris vulputate justo vulputate, venenatis orci eu, efficitur nisl. Nulla dignissim rhoncus neque, eget tincidunt nisl maximus ut. Ut aliquam condimentum ex sit amet varius. Maecenas rhoncus pellentesque lacus, at bibendum erat feugiat eget. Cras eu tellus aliquam, tempus enim tempor, lobortis orci.

{% endlist %}`,
    MERMAID: `\`\`\`mermaid
sequenceDiagram
	${PARAMS_TEXT.MERMAID_NAME}->>Bob: Hi Bob
	Bob->>Alice: Hi Alice
\`\`\`
`,
};

datalensTest.describe('Dashboards - Auto-height of widgets with dynamic content', () => {
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.deleteDash();
    });

    datalensTest(
        'When you open the md cut, it adjusts without scrolling',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addText({
                        text: PARAMS_CODE.CUT,
                        options: {autoHeight: true},
                    });
                },
            });

            const textWrapper = page.locator(slct(TextWidgetQa.Wrapper));
            const cutTitle = textWrapper.getByText(PARAMS_NAMES.CUT).first();
            const textContent = textWrapper.locator('> *');

            await expect(cutTitle).toBeVisible();

            // check the scroll of the child element of the container
            await dashboardPage.checkNoScroll({locator: textContent});

            await cutTitle.click();

            const cutContent = textWrapper.getByText(PARAMS_TEXT.CUT);
            await expect(cutContent).toBeVisible();

            await dashboardPage.checkNoScroll({locator: textContent});
        },
    );
    datalensTest(
        'When you switch the md tab, it adjusts without scrolling',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addText({
                        text: PARAMS_CODE.TABS,
                        options: {autoHeight: true},
                    });
                },
            });

            const textWrapper = page.locator(slct(TextWidgetQa.Wrapper));
            const tab2Title = textWrapper.getByText(PARAMS_NAMES.TAB_2).first();
            const tab1Content = textWrapper.getByText(PARAMS_TEXT.TAB_1);
            const textContent = textWrapper.locator('> *');

            await expect(tab1Content).toBeVisible();

            // check the scroll of the child element of the container
            await dashboardPage.checkNoScroll({locator: textContent});

            await tab2Title.click();

            const teb2Content = textWrapper.getByText(PARAMS_TEXT.TAB_2);
            await expect(teb2Content).toBeVisible();

            await dashboardPage.checkNoScroll({locator: textContent});
        },
    );
    datalensTest(
        'When you open mermaid chart, it adjusts without scrolling',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addText({
                        text: PARAMS_CODE.MERMAID,
                        options: {autoHeight: true},
                    });
                },
            });

            const textWrapper = page.locator(slct(TextWidgetQa.Wrapper));
            const mermaidContent = textWrapper.getByText(PARAMS_TEXT.MERMAID_NAME);
            const textContent = textWrapper.locator('> *');

            await expect(mermaidContent).toBeVisible();

            await dashboardPage.checkNoScroll({locator: textContent});
        },
    );
});
