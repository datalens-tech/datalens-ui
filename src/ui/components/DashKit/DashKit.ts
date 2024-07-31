import {DashKit} from '@gravity-ui/dashkit';
import {Feature} from 'shared';
import {isEmbeddedEntry} from 'ui/utils/embedded';

import {DL} from '../../constants';
import {getSdk} from '../../libs/schematic-sdk';
import MarkdownProvider from '../../modules/markdownProvider';
import Utils from '../../utils/utils';

import {getDashKitMenu} from './helpers';
import pluginControl from './plugins/Control/Control';
import pluginGroupControl from './plugins/GroupControl/GroupControl';
import textPlugin from './plugins/Text/Text';
import pluginTitle from './plugins/Title/Title';
import widgetPlugin from './plugins/Widget/WidgetPlugin';

let isConfigured = false;

const getDistinctsAction = () => {
    if (isEmbeddedEntry()) {
        return getSdk().bi.embedsGetDistinctsApiV2;
    }

    return Utils.isEnabledFeature(Feature.UsePublicDistincts)
        ? getSdk().bi.getPublicDistinctsApiV2
        : getSdk().bi.getDistinctsApiV2;
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
    );

    DashKit.setSettings({
        gridLayout: {margin: [8, 8]},
        theme: 'datalens',
        isMobile: DL.IS_MOBILE,
        menu: getDashKitMenu(),
    });

    return DashKit;
};
