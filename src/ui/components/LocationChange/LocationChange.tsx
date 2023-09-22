import React from 'react';

import {Location} from 'history';
import {useHistory} from 'react-router-dom';

export type LocationChangeProps = {
    onLocationChanged: (location: Location, prevLocation: Location) => void;
};

function LocationChange({onLocationChanged}: LocationChangeProps) {
    const history = useHistory();
    const [prevLocation, setPrevLocation] = React.useState<Location>(history.location);

    React.useEffect(() => {
        const unregisterCallback = history.listen((location) => {
            onLocationChanged(location, prevLocation);
            setPrevLocation(location);
        });
        return () => {
            unregisterCallback();
        };
    }, [history, prevLocation, onLocationChanged]);

    return null;
}

export default LocationChange;
