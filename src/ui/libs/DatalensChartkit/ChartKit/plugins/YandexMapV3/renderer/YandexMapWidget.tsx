import React from 'react';

import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';
import {CHARTKIT_ERROR_CODE, ChartKitError} from '@gravity-ui/chartkit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import Performance from '../../../../modules/perfomance';
import {getRandomCKId} from '../../../helpers/getRandomCKId';
import type {YandexMapWidgetProps} from '../types';

import {isYmapsReady} from './yamap';

import './YandexMapWidget.scss';

const Map = React.lazy(() => import('./components/Map/Map'));

const b = block('chartkit-ymap-widget');

export const YandexMapWidget = React.forwardRef<
    ChartKitWidgetRef | undefined,
    YandexMapWidgetProps
>((props, forwardedRef) => {
    const {
        id,
        // onLoad,
        data: {data: originalData, config, libraryConfig},
    } = props;

    const [isLoading, setLoading] = React.useState(true);

    const generatedId = React.useMemo(() => `${id}_${getRandomCKId()}`, [originalData, config, id]);
    Performance.mark(generatedId);

    React.useImperativeHandle(
        forwardedRef,
        () => ({
            reflow() {},
        }),
        [],
    );

    const loadYmap = React.useCallback(async () => {
        try {
            await isYmapsReady({
                apiKey: libraryConfig?.apiKey ?? '',
            });
            setLoading(false);
        } catch (e) {
            setLoading(false);
        }
    }, [libraryConfig?.apiKey]);

    React.useEffect(() => {
        loadYmap();
    }, [loadYmap]);

    if (!originalData || (typeof originalData === 'object' && !Object.keys(originalData).length)) {
        throw new ChartKitError({
            code: CHARTKIT_ERROR_CODE.NO_DATA,
        });
    }

    if (isLoading) {
        return (
            <div className={b()}>
                <Loader />
            </div>
        );
    }

    if (typeof ymaps3 === 'undefined') {
        throw Error('Could not load yandex-map API');
    }

    return (
        <div className={b()}>
            <Map {...props.data} />
        </div>
    );
});

YandexMapWidget.displayName = 'YandexMapWidget';

export default YandexMapWidget;
