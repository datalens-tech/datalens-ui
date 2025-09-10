import React from 'react';

import {HelpMark} from '@gravity-ui/uikit';
import type {ButtonButtonProps, HelpMarkProps, PopoverProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DL} from 'ui/constants';

import {Content} from './Content';

import './MarkdownHelpPopover.scss';

const i18n = I18n.keyset('dash.shared');
const b = block('markdown-help-popover');

type IconSize = 's' | 'm' | 'l' | 'xl';

type Props = Partial<Pick<HelpMarkProps, 'onClick'>> & {
    markdown: string;
    className?: string;
    buttonProps?: ButtonButtonProps;
    popoverProps?: Partial<PopoverProps>;
    iconSize?: IconSize;
};

export const MarkdownHelpPopover = (props: Props) => {
    const {
        markdown,
        onClick,
        buttonProps,
        popoverProps,
        iconSize = DL.IS_MOBILE ? 'l' : 'm',
    } = props;
    const [isLoaded, setLoaded] = React.useState(false);

    return (
        <HelpMark
            iconSize={iconSize}
            popoverProps={{
                ...popoverProps,
                className: b('tooltip', {hidden: !isLoaded}, popoverProps?.className),
            }}
            className={props.className ? props.className : b({mobile: DL.IS_MOBILE})}
            key={String(isLoaded)}
            aria-label={i18n('label_details')}
            {...(buttonProps ?? {})}
            onClick={onClick}
        >
            <div className={b('content')}>
                <Content value={markdown} onRender={() => setLoaded(true)} />
            </div>
        </HelpMark>
    );
};
