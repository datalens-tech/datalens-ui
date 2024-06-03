import React from 'react';

import ExtensionsManager from '../../../../modules/extensions-manager/extensions-manager';
import type {ChartKitBaseWrapperProps, ChartKitWrapperParams} from '../../types';
import type {State} from '../Content/store/types';

type ControlProps = Pick<ChartKitBaseWrapperProps, 'id' | 'noControls' | 'nonBodyScroll'> &
    Pick<ChartKitWrapperParams, 'onLoad' | 'onError' | 'onChange' | 'getControls'> &
    Pick<State, 'loadedData'>;

type ControlComponentProps = Omit<ControlProps, 'loadedData' | 'noControls'> & {
    data: ControlProps['loadedData'];
};

export const Control = ({
    loadedData,
    noControls,
    id,
    onLoad,
    onError,
    onChange,
    getControls,
    nonBodyScroll,
}: ControlProps) => {
    const showControl =
        !noControls && loadedData && 'controls' in loadedData && loadedData.controls;

    if (!showControl || !ExtensionsManager.has('control')) {
        return null;
    }

    const ControlComponent = ExtensionsManager.get(
        'control',
    ) as React.ComponentType<ControlComponentProps>;
    return (
        <ControlComponent
            id={id}
            data={loadedData}
            onLoad={onLoad}
            onError={onError}
            onChange={onChange}
            getControls={getControls}
            nonBodyScroll={nonBodyScroll}
        />
    );
};
