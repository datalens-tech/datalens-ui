import React from 'react';

import pluginTextBase, {
    PluginText,
    PluginTextObjectSettings,
    PluginTextProps,
} from '@gravity-ui/dashkit/build/esm/plugins/Text/Text';
import block from 'bem-cn-lite';

import {getRandomCKId} from '../../../../libs/DatalensChartkit/ChartKit/helpers/getRandomCKId';
import {YfmWrapper} from '../../../YfmWrapper/YfmWrapper';
import {RendererWrapper} from '../RendererWrapper/RendererWrapper';

import './Text.scss';

type Props = Omit<PluginTextProps, 'apiHandler'>;

const b = block('dashkit-plugin-text-container');

const textPlugin = {
    ...pluginTextBase,
    setSettings(settings: PluginTextObjectSettings) {
        const {apiHandler} = settings;
        pluginTextBase._apiHandler = apiHandler;
        return textPlugin;
    },
    renderer: function Wrapper(
        props: Props,
        forwardedRef: React.LegacyRef<PluginText> | undefined,
    ) {
        const [textReady, setTextReady] = React.useState<string>('');
        const [randomId, setRandomId] = React.useState<string>('');

        /**
         * get prepared text with markdown
         */
        const textHandler = React.useCallback(
            async (arg: {text: string}) => {
                const text = await pluginTextBase._apiHandler!(arg);
                setTextReady(text?.result);
                return text;
            },
            [pluginTextBase._apiHandler],
        );

        const content = <PluginText {...props} apiHandler={textHandler} ref={forwardedRef} />;

        /**
         * force rerender after get markdown text to see magic links
         */
        React.useEffect(() => {
            setRandomId(String(getRandomCKId()));
        }, [textReady]);

        return (
            <RendererWrapper type="text">
                <YfmWrapper
                    content={<div className={b('content-wrap', null, randomId)}>{content}</div>}
                    className={b()}
                />
            </RendererWrapper>
        );
    },
};

export default textPlugin;
