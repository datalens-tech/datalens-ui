import React from 'react';

import block from 'bem-cn-lite';
import LocationChange from 'components/LocationChange/LocationChange';
import type {Location} from 'history';
import {useDispatch} from 'react-redux';
import {setIsLanding} from 'store/actions/landing';
import {DL} from 'ui/constants/common';
import Utils from 'utils';

import ErrorContent from '../ErrorContent/ErrorContent';

import './LandingPage.scss';

const b = block('dl-landing-page');

export const LandingPage = () => {
    const dispatch = useDispatch();

    const locationSearchOptions = Utils.getOptionsFromSearch(window.location.search);
    const {errorType, title, description, entryMeta} = DL.LANDING_PAGE_SETTINGS || {};

    const handleLocationChanged = React.useCallback(
        (location: Location, prevLocation: Location) => {
            if (location.pathname === prevLocation.pathname && location.hash) {
                return;
            }
            dispatch(setIsLanding(false));
        },
        [dispatch],
    );

    return (
        <div className={b()}>
            <ErrorContent
                type={errorType}
                title={title}
                reqId={DL.REQUEST_ID}
                description={description}
                entryMeta={entryMeta}
                noControls={locationSearchOptions.noControls}
            />
            <LocationChange onLocationChanged={handleLocationChanged} />
        </div>
    );
};
