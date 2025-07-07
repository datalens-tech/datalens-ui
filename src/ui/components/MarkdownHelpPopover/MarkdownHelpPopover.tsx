import React from 'react';

import {HelpMark} from '@gravity-ui/uikit';
import type {ButtonProps, HelpMarkProps, PopoverProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DL} from 'ui/constants';

import {Content} from './Content';

import './MarkdownHelpPopover.scss';

const b = block('markdown-help-popover');

type Props = Partial<Pick<HelpMarkProps, 'onClick'>> & {
    markdown: string;
    className?: string;
    buttonProps?: ButtonProps;
    popoverProps?: Partial<PopoverProps>;
};

export const MarkdownHelpPopover = (props: Props) => {
    const {markdown, onClick, buttonProps, popoverProps} = props;
    const [isLoaded, setLoaded] = React.useState(false);

    return (
        <HelpMark
            popoverProps={{
                ...popoverProps,
                className: b('tooltip', {hidden: !isLoaded}),
            }}
            className={props.className ? props.className : b({mobile: DL.IS_MOBILE})}
            key={String(isLoaded)}
            {...(buttonProps ? {buttonProps} : {})}
            {...(onClick ? {onClick} : {})}
        >
            <div className={b('content')}>
                <Content value={markdown} onRender={() => setLoaded(true)} />
            </div>
        </HelpMark>
    );
};
