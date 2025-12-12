import React from 'react';

import type {DashKit as DashKitComponent} from '@gravity-ui/dashkit';
import {useDispatch, useSelector} from 'react-redux';

import {setDashKitRef} from '../../../../../store/actions/dashTyped';
import {selectDashkitRef} from '../../../../../store/selectors/dashTypedSelectors';

export const useDashkitRef = (): React.RefObject<DashKitComponent> => {
    const dispatch = useDispatch();

    const dashKitRefFromStore = useSelector(selectDashkitRef);
    const dashKitRef = React.useRef<DashKitComponent>(null);

    React.useEffect(() => {
        if (dashKitRef !== dashKitRefFromStore) {
            dispatch(setDashKitRef(dashKitRef));
        }
    }, [dispatch, dashKitRef, dashKitRefFromStore]);

    return dashKitRef;
};
