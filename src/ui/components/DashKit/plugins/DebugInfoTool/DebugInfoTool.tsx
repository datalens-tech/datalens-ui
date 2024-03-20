import React from 'react';

import block from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import {selectDebugMode} from 'store/selectors/user';

import './DebugInfoTool.scss';

const b = block('debug-info-tool');

type DataInfoProps = {
    label: string;
    value: string;
};

type DebugMultiInfoProps = {
    data: Array<DataInfoProps>;
};

type DebugInfoToolProps = (DataInfoProps | DebugMultiInfoProps) & {
    modType?: 'corner' | 'right' | 'outer' | 'bottom-right-corner' | 'top';
};

function getDebugText({label, value}: DataInfoProps, index?: number) {
    return (
        <span
            className={b('text')}
            key={index === undefined ? null : `debug-item-${label}-${value}-${index}`}
        >
            {label}: {value}
        </span>
    );
}

const DebugInfoTool = (props: DebugInfoToolProps) => {
    const dlDebugMode = useSelector(selectDebugMode);

    if (!dlDebugMode) {
        return null;
    }

    const text = (props as DebugMultiInfoProps).data?.length
        ? (props as DebugMultiInfoProps).data.map((item, index) => getDebugText(item, index))
        : getDebugText(props as DataInfoProps);

    const {modType} = props;
    const mod = modType ? {[modType]: true} : null;

    return <div className={b('label', mod)}>{text}</div>;
};

export default DebugInfoTool;
