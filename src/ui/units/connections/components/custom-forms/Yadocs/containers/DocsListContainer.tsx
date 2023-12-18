import React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import {setYadocsAddSectionState, yadocsAddSectionStateSelector} from 'ui/units/connections/store';

import {DocsList} from '../components';
import {AddYandexDoc, UpdateAddSectionState} from '../types';

export const DocsListContainer = () => {
    const dispatch = useDispatch();
    const addSectionState = useSelector(yadocsAddSectionStateSelector);

    const addYandexDoc = React.useCallback<AddYandexDoc>((_url) => {
        // TODO: add redux action
    }, []);

    const updateAddSectionState = React.useCallback<UpdateAddSectionState>(
        (updates) => {
            dispatch(setYadocsAddSectionState(updates));
        },
        [dispatch],
    );

    return (
        <DocsList
            addSectionState={addSectionState}
            addYandexDoc={addYandexDoc}
            updateAddSectionState={updateAddSectionState}
        />
    );
};
