import React from 'react';

import type {DashKit as DashKitComponent} from '@gravity-ui/dashkit';
import {useDispatch} from 'react-redux';

import {setDashKitRef} from '../../../../../store/actions/dashTyped';

export const useDashkitRef = (): React.RefObject<DashKitComponent> => {
    const dispatch = useDispatch();

    const dashKitRef = React.useRef<DashKitComponent>(null);

    React.useEffect(() => {
        dispatch(setDashKitRef(dashKitRef));
    }, [dispatch]);

    return dashKitRef;
};
