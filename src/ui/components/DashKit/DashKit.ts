import type {Plugin, PluginDefaultLayout} from '@gravity-ui/dashkit';
import {DashKit} from '@gravity-ui/dashkit';
import type {BackgroundSettings, OldBackgroundSettings} from 'shared';
import {registry} from 'ui/registry';

import {DL} from '../../constants';
import MarkdownProvider from '../../modules/markdownProvider';

import {DEFAULT_DASH_MARGINS, OLD_DEFAULT_WIDGET_BORDER_RADIUS} from './constants';
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

export interface CommonGlobalWidgetSettings {
    background?: OldBackgroundSettings;
    backgroundSettings?: BackgroundSettings;
    borderRadius?: number;
}

export interface CommonPluginSettings {
    scope?: string;
    globalWidgetSettings?: CommonGlobalWidgetSettings;
}

export interface CommonPluginProps {
    background?: OldBackgroundSettings;
    backgroundSettings?: BackgroundSettings;
    borderRadius?: number;
}

export const getConfiguredDashKit = (
    pluginDefaultsGetter: typeof currentDefaultsGetter = null,
    options?: {
        disableHashNavigation?: boolean;
        disableTitleHints?: boolean;
        scope?: string;
        globalWidgetSettings?: CommonGlobalWidgetSettings;
        // TODO: Remove later
    } & CommonGlobalWidgetSettings,
    shouldReconfigure?: boolean,
) => {
    if (currentDefaultsGetter !== pluginDefaultsGetter || !isConfigured || shouldReconfigure) {
        const commonSettings: CommonPluginSettings = {
            scope: options?.scope,
            globalWidgetSettings: {
                background: options?.globalWidgetSettings?.background,
                backgroundSettings: options?.globalWidgetSettings?.backgroundSettings,
                borderRadius:
                    options?.globalWidgetSettings?.borderRadius ?? OLD_DEFAULT_WIDGET_BORDER_RADIUS,
            },
        };
        const titleSettings = {
            ...commonSettings,
            hideAnchor: options?.disableHashNavigation,
            hideHint: options?.disableTitleHints,
        };

        const textSettings = {
            ...commonSettings,
            apiHandler: MarkdownProvider.getMarkdown,
        };

        const controlSettings = {
            ...commonSettings,
            getDistincts: getDistinctsAction(),
        };

        const plugins = wrapPlugins(
            [
                titlePlugin.setSettings(titleSettings),
                textPlugin.setSettings(textSettings),
                pluginControl.setSettings(controlSettings),
                pluginGroupControl.setSettings(controlSettings),
                widgetPlugin.setSettings(commonSettings),
                pluginImage.setSettings(commonSettings),
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
        gridLayout: {margin: DEFAULT_DASH_MARGINS},
        theme: 'datalens',
        isMobile: DL.IS_MOBILE,
        menu: getDashKitMenu(),
    });

    return DashkitWrapper;
};
