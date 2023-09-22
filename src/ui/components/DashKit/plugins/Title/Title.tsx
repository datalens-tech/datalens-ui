import React from 'react';

import pluginTitleBase, {
    PluginTitle,
    PluginTitleProps,
} from '@gravity-ui/dashkit/build/esm/plugins/Title/Title';
import block from 'bem-cn-lite';

import './Title.scss';

const b = block('dashkit-plugin-title-container');

type Props = PluginTitleProps;

const titlePlugin = {
    ...pluginTitleBase,
    renderer: function Wrapper(
        props: Props,
        forwardedRef: React.LegacyRef<PluginTitle> | undefined,
    ) {
        const content = <PluginTitle {...props} ref={forwardedRef} />;

        return <div className={b()}>{content}</div>;
    },
};

export default titlePlugin;
