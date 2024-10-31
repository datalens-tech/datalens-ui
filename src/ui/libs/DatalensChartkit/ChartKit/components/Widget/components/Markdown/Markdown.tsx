import React from 'react';

import block from 'bem-cn-lite';
import get from 'lodash/get';
import type {MarkdownWidget, WidgetProps} from 'ui/libs/DatalensChartkit/types';

import {YfmWrapper} from '../../../../../../../components/YfmWrapper/YfmWrapper';
import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../../../helpers/constants';
import {getRandomCKId} from '../../../../helpers/getRandomCKId';
import {waitForContent} from '../../../../helpers/wait-for-content';
import Performance from '../../../../modules/perfomance';
import {SNAPTER_HTML_CLASSNAME} from '../constants';

import './Markdown.scss';

const b = block('chartkit-markdown');

type MarkdownProps = Omit<WidgetProps, 'data'> & {
    data: MarkdownWidget;
};

export function Markdown({data, onLoad, id}: MarkdownProps) {
    const generatedId = React.useMemo(() => `${id}_${getRandomCKId()}`, [data, id]);
    Performance.mark(generatedId);
    const refLink = React.useRef(null);
    const {html = '', markdown = '', meta} = data.data;

    const metaScripts = get(meta, 'script');

    React.useLayoutEffect(() => {
        if (onLoad && refLink.current) {
            waitForContent(refLink.current).then(() => {
                onLoad({widgetRendering: Performance.getDuration(generatedId)});
            });
        }
    }, [generatedId, onLoad, refLink]);

    if (!html && !markdown) {
        return null;
    }

    return html ? (
        <YfmWrapper
            className={b({}, `${CHARTKIT_SCROLLABLE_NODE_CLASSNAME} ${SNAPTER_HTML_CLASSNAME}`)}
            setByInnerHtml={true}
            content={html}
            metaScripts={metaScripts}
            ref={refLink}
        />
    ) : (
        <YfmWrapper
            className={b({}, `${CHARTKIT_SCROLLABLE_NODE_CLASSNAME} ${SNAPTER_HTML_CLASSNAME}`)}
            content={markdown}
            ref={refLink}
        />
    );
}
