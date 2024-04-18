import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import block from 'bem-cn-lite';

import './Subheader.scss';

const b = block('dialog-column-settings');

type Props = {
    title: string;
    tooltip?: string;
};

export const Subheader = (props: Props) => {
    const {title, tooltip} = props;

    return (
        <div>
            <span className={b('subheader')}>{title}</span>
            {tooltip && <HelpPopover content={tooltip} placement={'right'} />}
        </div>
    );
};
