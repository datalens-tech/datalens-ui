import React from 'react';

import block from 'bem-cn-lite';

import './DialogRow.scss';

export type DialogRowProps = {
    title: JSX.Element | string;
    setting: JSX.Element | string;
    titleCustomWidth?: string;
    settingCustomWidth?: string;
    rowCustomMarginBottom?: string;
    customGapBetweenTitleAndSetting?: string;
};

const b = block('dialog-row');

const DEFAULT_TITLE_WIDTH = '172px';
const DEFAULT_SETTING_WIDTH = '1fr';
const DEFAULT_ROW_MARGIN_BOTTOM = '16px';
const DEFAULT_GAP_BETWEEN_TITLE_AND_SETTING = '0px';

export const DialogRow: React.FC<DialogRowProps> = (props: DialogRowProps) => {
    const {
        title,
        settingCustomWidth,
        titleCustomWidth,
        rowCustomMarginBottom,
        setting,
        customGapBetweenTitleAndSetting,
    } = props;

    const titleWidth = titleCustomWidth ? titleCustomWidth : DEFAULT_TITLE_WIDTH;
    const settingWidth = settingCustomWidth ? settingCustomWidth : DEFAULT_SETTING_WIDTH;
    const marginBottom = rowCustomMarginBottom ? rowCustomMarginBottom : DEFAULT_ROW_MARGIN_BOTTOM;
    const columnGap = customGapBetweenTitleAndSetting
        ? customGapBetweenTitleAndSetting
        : DEFAULT_GAP_BETWEEN_TITLE_AND_SETTING;

    const gridTemplateColumns = `${titleWidth} ${settingWidth}`;

    return (
        <div className={b()} style={{gridTemplateColumns, marginBottom, columnGap}}>
            <div>{title}</div>
            <div className={b('setting')}>{setting}</div>
        </div>
    );
};
