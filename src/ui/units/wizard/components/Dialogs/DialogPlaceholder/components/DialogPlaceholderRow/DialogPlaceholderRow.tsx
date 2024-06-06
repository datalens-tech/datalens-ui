import React from 'react';

import type {DialogRowProps} from '../../../components/DialogRow/DialogRow';
import {DialogRow} from '../../../components/DialogRow/DialogRow';

type DialogPlaceholderRowProps = DialogRowProps;

export const DialogPlaceholderRow: React.FC<DialogPlaceholderRowProps> = (
    props: DialogPlaceholderRowProps,
) => {
    const {
        rowCustomMarginBottom,
        setting,
        customGapBetweenTitleAndSetting,
        settingCustomWidth,
        titleCustomWidth,
        title,
    } = props;
    return (
        <DialogRow
            titleCustomWidth={titleCustomWidth || '155px'}
            rowCustomMarginBottom={rowCustomMarginBottom || '20px'}
            customGapBetweenTitleAndSetting={customGapBetweenTitleAndSetting}
            title={title}
            setting={setting}
            settingCustomWidth={settingCustomWidth}
        />
    );
};
