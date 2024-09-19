import {DashKit} from '@gravity-ui/dashkit';
import {registry} from 'ui/registry';

import {DL} from '../../constants';
import MarkdownProvider from '../../modules/markdownProvider';

import {getDashKitMenu} from './helpers';
import pluginControl from './plugins/Control/Control';
import pluginGroupControl from './plugins/GroupControl/GroupControl';
import {pluginImage} from './plugins/Image/Image';
import textPlugin from './plugins/Text/Text';
import pluginTitle from './plugins/Title/Title';
import widgetPlugin from './plugins/Widget/WidgetPlugin';

let isConfigured = false;

const getDistinctsAction = () => {
    const fetchDistinctsByApi = registry.common.functions.get('fetchDistinctsByApi');

    return fetchDistinctsByApi;
};

export const getConfiguredDashKit = () => {
    if (isConfigured) {
        return DashKit;
    }

    const controlSettings = {
        getDistincts: getDistinctsAction(),
    };

    isConfigured = true;

    DashKit.registerPlugins(
        pluginTitle,
        textPlugin.setSettings({
            apiHandler: MarkdownProvider.getMarkdown,
        }),
        pluginControl.setSettings(controlSettings),
        pluginGroupControl.setSettings(controlSettings),
        widgetPlugin,
        pluginImage,
    );

    DashKit.setSettings({
        gridLayout: {margin: [8, 8]},
        theme: 'datalens',
        isMobile: DL.IS_MOBILE,
        menu: getDashKitMenu(),
    });

    return DashKit;
};
