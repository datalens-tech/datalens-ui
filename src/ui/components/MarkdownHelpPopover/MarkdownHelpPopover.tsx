import React from 'react';

import type {HelpPopoverProps} from '@gravity-ui/components';
import {HelpPopover} from '@gravity-ui/components';
import block from 'bem-cn-lite';
import {DL} from 'ui/constants';

import {Content} from './Content';

import './MarkdownHelpPopover.scss';

const b = block('markdown-help-popover');

type Props = Partial<Pick<HelpPopoverProps, 'onClick'>> & {
    markdown: string;
    className: string;
};

export const MarkdownHelpPopover = (props: Props) => {
    const {markdown, onClick} = props;
    const [isLoaded, setLoaded] = React.useState(false);

    return (
        <HelpPopover
            content={<Content value={markdown} onRender={() => setLoaded(true)} />}
            className={props.className ? props.className : b({mobile: DL.IS_MOBILE})}
            contentClassName={b('content')}
            tooltipClassName={b('tooltip', {hidden: !isLoaded})}
            key={String(isLoaded)}
            initialOpen={isLoaded}
            {...(onClick ? {onClick} : {})}
        />
    );
};
