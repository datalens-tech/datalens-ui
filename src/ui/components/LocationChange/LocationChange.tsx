import React from 'react';

import type {Location} from 'history';
import {useHistory} from 'react-router-dom';

export type LocationChangeProps = {
    onLocationChanged: (location: Location, prevLocation: Location) => void;
};

function LocationChange({onLocationChanged}: LocationChangeProps) {
    const history = useHistory();
    const [prevLocation, setPrevLocation] = React.useState<Location>(history.location);
    // https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback
    // For reducing the useEffect cleanup calls from onLocationChanged changing every render
    // Frequent rerenders caused unstable dispatch of postMessage events for embedded dashboards
    const callbackRef = React.useRef<LocationChangeProps['onLocationChanged']>(onLocationChanged);

    React.useLayoutEffect(() => {
        callbackRef.current = onLocationChanged;
    });

    React.useEffect(() => {
        const unregisterCallback = history.listen((location) => {
            callbackRef.current(location, prevLocation);
            setPrevLocation(location);
        });
        return () => {
            unregisterCallback();
        };
    }, [history, prevLocation]);

    return null;
}

export default LocationChange;
