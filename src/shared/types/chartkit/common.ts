import type {StandardLonghandPropertiesHyphen} from 'csstype';

export type ChartKitCss = React.CSSProperties | StandardLonghandPropertiesHyphen;

export type ChartkitGlobalSettings = {
    highcharts?: {
        enabled?: boolean;
        /** Use as an external dependency (the files are loaded from CDN) */
        external?: boolean;
        domain?: string;
        protocol?: string;
        /** List of highcharts modules to be downloaded from CDN. The setting is used only for the enabled "external" flag  */
        modules?: string[];
        version?: string;
    };

    yandexMap?: {
        enabled?: boolean;
    };
};
