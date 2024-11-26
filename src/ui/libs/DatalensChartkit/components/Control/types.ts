import type {StringParams} from 'shared';
import type {ChartInitialParams} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';

import type {
    ActiveControl,
    ControlsOnlyWidget,
    OnChangeData,
    OnLoadData,
    WidgetProps,
} from '../../types';

export type ControlProps<TProviderData = unknown> = {
    data: ControlsOnlyWidget & TProviderData;
    getControls: (params: StringParams) => Promise<(ControlsOnlyWidget & TProviderData) | null>;
    onLoad: (data?: OnLoadData) => void;
    onChange: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => void;
    onUpdate?: (data: OnChangeData) => void;
    initialParams?: ChartInitialParams;
    runAction: (args: StringParams) => Promise<unknown>;
    onAction: (args: {data: unknown}) => void;
} & Omit<WidgetProps, 'data'>;

export interface ControlState {
    status: 'loading' | 'done' | 'error';
    data: ControlProps['data'];
    // TODO: think about to move logic to componentDidUpdate
    // TODO: think about to move logic to ChartKit by calling onChange in onLoad, and not immediately
    savedData: ControlProps['data'];
    params: StringParams;
    statePriority: boolean;
    validationErrors: {[key: string]: string | null};
}

export type ControlValue = string | string[] | {from: string | string[]; to: string | string[]};
export type SimpleControlValue = string | string[] | {from: string; to: string};

export type ControlItemProps = ActiveControl & {
    value: ControlValue;
    onChange: (value: SimpleControlValue) => void;
    [key: string]: any;
};
