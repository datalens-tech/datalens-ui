import React from 'react';

import {DialogRow} from '../../../components/DialogRow/DialogRow';
import {TitleWithTooltip} from '../../../components/TitleWithTooltip/TitleWithTooltip';

type Props = {
    title: string;
    tooltipText?: string;
    setting: JSX.Element;
    customMarginBottom?: string;
    settingCustomWidth?: string;
};

export const DialogFieldRow: React.FC<Props> = (props: Props) => {
    return (
        <DialogRow
            rowCustomMarginBottom={props.customMarginBottom}
            settingCustomWidth="272px"
            customGapBetweenTitleAndSetting="5px"
            title={
                props.tooltipText ? (
                    <TitleWithTooltip text={props.tooltipText} title={props.title} />
                ) : (
                    props.title
                )
            }
            setting={props.setting}
        />
    );
};
