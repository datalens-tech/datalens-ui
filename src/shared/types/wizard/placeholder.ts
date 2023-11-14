import {IconProps} from '@gravity-ui/uikit';

import {PlaceholderId} from '../../constants';

import {Field} from './field';

import {Sort} from './index';

export interface PlaceholderSettings {
    scale?: string;
    scaleValue?: string | [string, string];
    title?: string;
    titleValue?: string;
    type?: string;
    grid?: string;
    gridStep?: string;
    gridStepValue?: number;
    hideLabels?: string;
    labelsView?: string;
    nulls?: string;
    holidays?: string;
    polylinePoints?: string;
    axisFormatMode?: string;
    axisModeMap?: Record<string, string>;
    disableAxisMode?: boolean;
}

export type Placeholder = {
    id: string;
    type: string;
    title: string;
    iconProps: IconProps;
    capacity?: number;
    transform?: (item: Field) => Field;
    allowedTypes?: Set<string>;
    checkAllowed?: Set<string>;
    items: Field[];
    settings?: Record<string, any>;
    required?: boolean;
    onChange?: ({
        placeholder,
        visualization,
        colors,
        sort,
        shapes,
    }: {
        placeholder: Placeholder;
        visualization: any;
        colors: Field[];
        sort: Sort[];
        shapes: Field[];
        placeholderId: PlaceholderId;
    }) => void;
    allowedDataTypes?: Set<string>;
    allowedFinalTypes?: Set<string>;
};

export type AxisMode = 'discrete' | 'continuous';
