import React from 'react';

import {HelpMark} from '@gravity-ui/uikit';
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
            {tooltip && (
                <HelpMark popoverProps={{placement: 'right', style: {maxWidth: 300}}}>
                    {tooltip}
                </HelpMark>
            )}
        </div>
    );
};
