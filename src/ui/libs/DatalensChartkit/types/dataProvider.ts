import {URL_OPTIONS} from 'ui/constants/common';

import {StringParams} from '../../../../shared';

import {ControlsOnlyWidget, Widget} from './widget';
//import {ChartKitLoadSuccess, ChartKitProps} from '../components/ChartKitBase/ChartKitBase'; // TODO after remove old alternative Chartkit code, cause cycle imports
//import {ChartsData, ChartsProps, ChartsStats} from '../modules/data-provider/charts'; // TODO after remove old alternative Chartkit code, cause cycle imports

type UrlKeys = keyof typeof URL_OPTIONS;

export interface DataProvider<T extends {params?: StringParams}, R, K> {
    getRequestCancellation: () => K;
    cancelRequests: (requestCancellation: K) => void;
    isEqualProps: (a: T, b: T) => boolean;
    getWidget: ({
        props,
        requestId,
        requestCancellation,
    }: {
        props: T;
        requestId: string;
        requestCancellation: K;
    }) => Promise<(Widget & R) | null>;
    getControls?: ({
        props,
        requestId,
        requestCancellation,
    }: {
        props: T;
        requestId: string;
        requestCancellation: K;
    }) => Promise<(ControlsOnlyWidget & R) | null>;
    setSettings?: <TSettings>(settings: TSettings) => void;
    pushStats?: (
        input: any, // ChartKitLoadSuccess<ChartsData>, // TODO after remove old alternative Chartkit code, cause cycle imports
        externalStats: any, // Partial<ChartsStats>, // TODO after remove old alternative Chartkit code, cause cycle imports
    ) => void;
    getGoAwayLink: (
        param1: {
            loadedData: any; //(Widget & ChartsData) | {}; // TODO after remove old alternative Chartkit code, cause cycle imports
            propsData: any; // ChartKitProps<ChartsProps, ChartsData>; // TODO after remove old alternative Chartkit code, cause cycle imports
        },
        params2: {
            urlPostfix?: string;
            idPrefix: string;
            extraParams?: Partial<
                Record<UrlKeys, string> & {
                    _chart_type: 'table';
                }
            >;
        },
    ) => string | undefined;
    endpoint?: string;
}
