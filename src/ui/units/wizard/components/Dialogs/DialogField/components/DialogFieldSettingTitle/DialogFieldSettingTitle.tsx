import React from 'react';

import block from 'bem-cn-lite';

import './DialogFieldSettingTitle.scss';

type Props = {
    title: string;
};

const b = block('dialog-field-setting-title');

export const DialogFieldSettingTitle: React.FC<Props> = ({title}: Props) => {
    return <span className={b()}>{title}</span>;
};
