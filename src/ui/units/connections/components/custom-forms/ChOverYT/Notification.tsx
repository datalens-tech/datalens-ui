import React from 'react';

import {CircleInfo} from '@gravity-ui/icons';
import block from 'bem-cn-lite';

const b = block('conn-form-chyt');
const ICON_SIZE = 21;

type Props = {
    text: string;
};

export const Notification = ({text}: Props) => {
    return (
        <div className={b('notification')}>
            <CircleInfo color="var(--g-color-text-info)" width={ICON_SIZE} height={ICON_SIZE} />
            {text}
        </div>
    );
};
