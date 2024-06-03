import type {DatasetField, VisualizationLayerType} from '../../../../shared';

export interface GeolayerSettings {
    id: string;
    name: string;
    type: VisualizationLayerType;
    alpha: number;
    valid: boolean;
}

interface LinkField {
    dataset: {
        id: string;
        realName: string;
    };
    field: DatasetField;
}

export interface Link {
    id: string;
    fields: {
        [datasetId: string]: LinkField;
    };
}

export interface ThresholdsValidationStatus {
    left?: {
        text: string;
    };
    middle?: {
        text: string;
    };
    right?: {
        text: string;
    };
}
