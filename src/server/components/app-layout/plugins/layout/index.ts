import path from 'path';

import type {RenderHelpers} from '@gravity-ui/app-layout';
import {createLayoutPlugin as createLayoutPluginBase} from '@gravity-ui/app-layout';

const filename = 'assets-manifest.json';

const manifest = path.resolve(path.parse(require.main!.filename).dir, '../public/build', filename);
const publicPath = '/build/';

export function createLayoutPlugin(): ReturnType<typeof createLayoutPluginBase> {
    const layoutPlugin = createLayoutPluginBase({publicPath, manifest});
    return {
        name: layoutPlugin.name,
        apply({options, commonOptions, renderContent, utils}) {
            layoutPlugin.apply({options, commonOptions, renderContent, utils});
            if (!renderContent.bodyContent.root) {
                renderContent.bodyContent.root = getSpinner(utils);
            }
        },
    };
}

function getSpinner(utils: RenderHelpers) {
    const styles = utils.renderInlineStyle(`
        @keyframes yc-pulse {
            50% {
                background: rgb(255, 190, 92);
            }
        }
        .g-loader {
            position: relative;
            background: rgba(255, 190, 92, 0.14);
            animation: yc-pulse ease 800ms infinite;
            animation-delay: 400ms;
        }
        .g-loader:before, .g-loader:after {
            content: "";
            position: absolute;
            display: block;
            background: rgba(255, 190, 92, 0.14);
            top: 50%;
            transform: translateY(-50%);
            animation: yc-pulse ease 800ms infinite;
        }
        .g-loader:before {
            animation-delay: 200ms;
        }
        .g-loader:after {
            animation-delay: 600ms;
        }
        .g-loader_size_l {
            width: 9px;
            height: 36px;
        }
        .g-loader_size_l:before {
            height: 24px;
            width: 9px;
            left: -18px;
        }
        .g-loader_size_l:after {
            height: 24px;
            width: 9px;
            left: 18px;
        }

        .local_wrapper {
            justify-content: center;
            align-items: center;
            height: 100%;
        }

        .g-root_theme_dark .local_wrapper {
            background-color: var(--g-color-base-background, rgb(45, 44, 51));
        }
        .g-root_theme_dark-hc .local_wrapper {
            background-color: var(--g-color-base-background, rgb(34, 35, 38));
        }

        html, body, #root {
            width: 100%;
            height: 100%;
            margin: 0;
        }
    `);

    const loader = `
        <div class="local_wrapper" id="local_wrapper" style="display: none">
            <div class="yc-loader yc-loader_size_l"></div>
        </div>
    `;

    const template = `
    ${styles}
    ${loader}
    ${utils.renderInlineScript(`
        setTimeout(function() {
            const element = document.getElementById("local_wrapper");
            element && element.setAttribute('style', 'display: flex');
        }, 100);
    `)}
`;
    return template;
}
