import * as fs from 'fs';
import * as path from 'path';

import type {ServiceConfig} from '@gravity-ui/app-builder';
// eslint-disable-next-line import/no-extraneous-dependencies
import type {FileCacheOptions, MemoryCacheOptions} from 'webpack';

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

const getFileCacheConfig = () => {
    if (process.env.APP_ENV === 'development') {
        return {
            type: 'filesystem',
        } as FileCacheOptions;
    } else {
        return {
            type: 'memory',
        } as MemoryCacheOptions;
    }
};

const vendors = (vendorsList: string[]) => {
    return vendorsList.concat([
        'react-split-pane',
        'react-dnd',
        'react-grid-layout',
        'react-beautiful-dnd',
        '@react-dnd',
        '@gravity-ui/uikit',
        '@gravity-ui/react-data-table',
        '@gravity-ui/navigation',
        '@gravity-ui/components',
        '@gravity-ui/date-components',
        '@gravity-ui/icons',
        '@gravity-ui/chartkit',
        '@gravity-ui/date-utils',
        '@popperjs',
        'yup',
        'rc-slider',
        'rc-util',
        'dnd-core',
        'react-transition-group',
        'jsondiffpatch',
        'history',
        'luxon',
        'd3-selection',
    ]);
};

const config: ServiceConfig = {
    client: {
        alias: {
            i18n: 'src/i18n',
            shared: 'src/shared',
            ui: 'src/ui',
        },
        modules: [
            'node_modules',
            resolveApp('node_modules'),
            resolveApp('src/ui'),
            resolveApp('src/ui/units'),
        ],
        includes: ['src/shared', 'src/i18n', 'node_modules/monaco-editor/esm/vs'],
        excludeFromClean: ['!i18n', '!i18n/**/*'],
        vendors,
        icons: ['src/ui/assets/icons', 'node_modules/@gravity-ui/icons'],
        monaco: {
            languages: ['typescript', 'javascript', 'json', 'sql', 'mysql'],
        },
        polyfill: {
            process: true,
        },
        disableReactRefresh: true,
        contextReplacement: {
            locale: ['ru', 'en'],
        },
        watchOptions: {
            ignored: '**/server',
            aggregateTimeout: 1000,
        },
        cache: getFileCacheConfig(),
        externals: {
            highcharts: 'Highcharts',
        },
        fallback: {
            url: require.resolve('url'),
            'react/jsx-runtime': require.resolve('react/jsx-runtime'),
            path: false,
            fs: false,
            'cose-base': false,
            'layout-base': false,
            'highlight.js': false,
        },
    },
    server: {
        watch: ['dist/i18n', 'dist/shared'],
    },
};

export default config;
