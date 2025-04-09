import type {ServerTooltipConfig} from '../../../../../../../shared';
import type {Coordinate} from '../../utils/geo-helpers';

export type GeopointPointConfig = {
    feature: {
        geometry: {
            type: 'Point';
            coordinates: Coordinate[];
        };
        properties: Record<string, any>;
    };
    options: {
        iconColor: string;
        preset: string;
        zIndex: number;
    };
    columnIndex: number;
};

export type GeopointMapOptions = {
    radius?: number;
    dissipating?: boolean;
    opacity: number;
    intensityOfMidpoint?: number;
    gradient?: Record<string, string>;
    showCustomLegend?: boolean;
    colorTitle?: string;
    geoObjectId?: string;
    layerTitle?: string;
    sizeMinValue?: number;
    colorDictionary?: Record<string, string>;
    sizeMaxValue?: number;
    mode?: string;
    sizeTitle?: string;
    tooltipConfig?: ServerTooltipConfig;
};

export type GeopointPrepareResult = {
    options: GeopointMapOptions;
    bounds?: (Coordinate | undefined)[];
};
