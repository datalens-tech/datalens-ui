import type {IconProps} from '@gravity-ui/uikit';

import type {PlaceholderId} from '../../constants';

import type {Field} from './field';

import type {Sort} from './index';

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
    axisVisibility?: string;
}

export type Placeholder = {
    id: string;
    type: string;
    title: string;
    iconProps: IconProps;
    capacity?: number;
    transform?: (item: Field) => Field;
    allowedTypes?: Set<string>;
    checkAllowed?: (item: Field) => boolean;
    items: Field[];
    settings?: Record<string, any>;
    required?: boolean;
    onChange?: (params: {
        placeholder: Placeholder;
        visualization: any;
        colors: Field[];
        sort: Sort[];
        shapes: Field[];
        placeholderId: PlaceholderId;
        isQL: boolean;
    }) => void;
    allowedDataTypes?: Set<string>;
    allowedFinalTypes?: Set<string>;
};
