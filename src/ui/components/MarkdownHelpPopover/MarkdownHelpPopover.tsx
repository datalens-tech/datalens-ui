import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import block from 'bem-cn-lite';
import {DL} from 'ui/constants';

import {Content} from './Content';

import './MarkdownHelpPopover.scss';

const b = block('markdown-help-popover');

type Props = {
    markdown: string;
};

export const MarkdownHelpPopover = (props: Props) => {
    const {markdown} = props;
    const [isLoaded, setLoaded] = React.useState(false);

    return (
        <HelpPopover
            content={<Content value={markdown} onRender={() => setLoaded(true)} />}
            className={b({mobile: DL.IS_MOBILE})}
            contentClassName={b('content')}
            tooltipClassName={b('tooltip', {hidden: !isLoaded})}
            key={String(isLoaded)}
            initialOpen={isLoaded}
        />
    );
};
