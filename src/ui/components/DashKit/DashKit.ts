import type {Plugin, PluginDefaultLayout} from '@gravity-ui/dashkit';
import {DashKit} from '@gravity-ui/dashkit';
import {registry} from 'ui/registry';

import {DL} from '../../constants';
import MarkdownProvider from '../../modules/markdownProvider';

import {DashkitWrapper, getDashKitMenu} from './helpers';
import pluginControl from './plugins/Control/Control';
import pluginGroupControl from './plugins/GroupControl/GroupControl';
import {pluginImage} from './plugins/Image/Image';
import textPlugin from './plugins/Text/Text';
import titlePlugin from './plugins/Title/Title';
import widgetPlugin from './plugins/Widget/WidgetPlugin';

let isConfigured = false;

const getDistinctsAction = () => {
    const fetchDistinctsByApi = registry.common.functions.get('fetchDistinctsByApi');

    return fetchDistinctsByApi;
};

let currentDefaultsGetter: ((plugin: Plugin) => PluginDefaultLayout) | null = null;
const wrapPlugins = (plugins: Plugin[], pluginDefaultsGetter?: typeof currentDefaultsGetter) => {
    return plugins.map((plugin) => {
        return {
            ...plugin,
            defaultLayout: pluginDefaultsGetter
                ? pluginDefaultsGetter(plugin)
                : plugin.defaultLayout,
        };
    });
};

export const getConfiguredDashKit = (
    pluginDefaultsGetter: typeof currentDefaultsGetter = null,
    options?: {disableHashNavigation?: boolean},
) => {
    if (currentDefaultsGetter !== pluginDefaultsGetter || !isConfigured) {
        const titleSettings = {
            hideAnchor: options?.disableHashNavigation,
        };

        const textSettings = {
            apiHandler: MarkdownProvider.getMarkdown,
        };

        const controlSettings = {
            getDistincts: getDistinctsAction(),
        };

        const plugins = wrapPlugins(
            [
                titlePlugin.setSettings(titleSettings),
                textPlugin.setSettings(textSettings),
                pluginControl.setSettings(controlSettings),
                pluginGroupControl.setSettings(controlSettings),
                widgetPlugin,
                pluginImage,
            ],
            pluginDefaultsGetter,
        );

        if (isConfigured) {
            DashKit.reloadPlugins(...plugins);
        } else {
            DashKit.registerPlugins(...plugins);
        }

        currentDefaultsGetter = pluginDefaultsGetter;
    }

    if (isConfigured) {
        return DashkitWrapper;
    }

    isConfigured = true;

    DashKit.setSettings({
        gridLayout: {margin: [8, 8]},
        theme: 'datalens',
        isMobile: DL.IS_MOBILE,
        menu: getDashKitMenu(),
    });

    return DashkitWrapper;
};
