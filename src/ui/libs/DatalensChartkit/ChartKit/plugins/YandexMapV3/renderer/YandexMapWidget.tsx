import React from 'react';

import {CHARTKIT_ERROR_CODE, ChartKitError} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';

import Performance from '../../../../modules/perfomance';
import {getRandomCKId} from '../../../helpers/getRandomCKId';
import type {YandexMapWidgetProps} from '../types';
import {isYmapsReady} from './yamap';
import {Loader} from '@gravity-ui/uikit';

import './YandexMapWidget.scss';

const Map = React.lazy(() => import('./components/Map/Map'));

const b = block('chartkit-ymap-widget');

export const YandexMapWidget = (props: YandexMapWidgetProps) => {
    const {
        id,
        // onLoad,
        data: {data: originalData, config, libraryConfig},
        // _splitTooltip,
    } = props;

    const [isLoading, setLoading] = React.useState(true);

    const generatedId = React.useMemo(() => `${id}_${getRandomCKId()}`, [originalData, config, id]);
    Performance.mark(generatedId);

    React.useEffect(() => {
        isYmapsReady({
            apiKey: libraryConfig?.apiKey ?? ''
        }).then(() => {
            // setLoading(false);
        })
    }, []);

    if (!originalData || (typeof originalData === 'object' && !Object.keys(originalData).length)) {
        throw new ChartKitError({
            code: CHARTKIT_ERROR_CODE.NO_DATA,
        });
    }

    return (
        <div className={b()}>
            {isLoading ? <Loader /> : <Map />}
        </div>
    );
};

export default YandexMapWidget;
