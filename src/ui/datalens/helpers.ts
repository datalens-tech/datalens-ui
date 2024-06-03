import type {LocationChangeProps} from '../components/LocationChange/LocationChange';
import {CounterName, fireMetricaHit} from '../libs/metrica';

export const locationChangeHandler: LocationChangeProps['onLocationChanged'] = (
    location,
    prevLocation,
) => {
    if (location.pathname !== prevLocation.pathname) {
        fireMetricaHit(CounterName.Main, location.pathname);
        fireMetricaHit(CounterName.Cross, location.pathname);
    }
};
