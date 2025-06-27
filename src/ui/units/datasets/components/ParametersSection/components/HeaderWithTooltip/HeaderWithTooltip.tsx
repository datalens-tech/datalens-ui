import React from 'react';

import {HelpMark} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {registry} from 'ui/registry';

import {YfmWrapper} from '../../../../../../components/YfmWrapper/YfmWrapper';

import './HeaderWithTooltip.scss';

const b = block('parameters-tab_header-tooltip');

type HeaderTooltipProps = {
    title: string;
    yfmString: React.ReactNode;
};

const HeaderWithTooltip: React.FC<HeaderTooltipProps> = (props: HeaderTooltipProps) => {
    const {title, yfmString} = props;
    return (
        <span className={b()}>
            {title}
            <HelpMark
                popoverProps={{
                    placement: ['bottom', 'right'],
                    className: b('tooltip'),
                    style: {maxWidth: 300},
                }}
                className={b('tooltip-anchor')}
            >
                <YfmWrapper content={yfmString} setByInnerHtml={true} />
            </HelpMark>
        </span>
    );
};

export const getHeaderWithTooltipNode = (title: string, tooltipText: string) => {
    const fetchRenderedMarkdown = registry.common.functions.get('fetchRenderedMarkdown');

    return fetchRenderedMarkdown(tooltipText)
        .then((data) => {
            const result = data.result;
            return <HeaderWithTooltip title={title} yfmString={result} />;
        })
        .catch((e) => {
            console.error('renderHeaderTooltip failed', e);
            return title;
        });
};
