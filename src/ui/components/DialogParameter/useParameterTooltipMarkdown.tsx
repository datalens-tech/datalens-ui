import React from 'react';

import {I18n} from 'i18n';
import {registry} from 'ui/registry';

import {YfmWrapper} from '../YfmWrapper/YfmWrapper';

const i18n = I18n.keyset('component.dialog-parameter');

export const useFetchParameterTooltipMarkdown = () => {
    const [tooltipText, setTooltipText] = React.useState<React.ReactNode>('');
    const [isTooltipLoading, setIsTooltipLoading] = React.useState<boolean>(true);
    React.useEffect(() => {
        const fetchRenderedMarkdown = registry.common.functions.get('fetchRenderedMarkdown');

        fetchRenderedMarkdown(i18n('parameter_name-note'))
            .then((response) => {
                const yfmString = response.result;
                setTooltipText(<YfmWrapper content={yfmString} setByInnerHtml={true} />);
                setIsTooltipLoading(false);
            })
            .catch((e) => {
                console.error('useFetchParameterTooltipMarkdown failed ', e);
                setIsTooltipLoading(false);
            });
    }, []);

    return {tooltipText, isTooltipLoading};
};
