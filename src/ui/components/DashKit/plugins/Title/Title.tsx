import React from 'react';

import {PluginTitle, PluginTitleProps, pluginTitle} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';

import './Title.scss';

const b = block('dashkit-plugin-title-container');

type Props = PluginTitleProps;

const titlePlugin = {
    ...pluginTitle,
    renderer: function Wrapper(
        props: Props,
        forwardedRef: React.LegacyRef<PluginTitle> | undefined,
    ) {
        const content = <PluginTitle {...props} ref={forwardedRef} />;

        return <div className={b()}>{content}</div>;
    },
};

export default titlePlugin;
