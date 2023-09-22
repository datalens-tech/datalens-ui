import React from 'react';

import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';

import {setGSheetFormData} from '../../../store';

import {ActionBarContainer, SheetsListContainer, WorkspaceContainer} from './containers';

import './GSheetsV2.scss';

const b = block('conn-form-gsheets');

export const GSheetsV2 = () => {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(setGSheetFormData());
    }, [dispatch]);

    return (
        <div className={b()}>
            <ActionBarContainer />
            <div className={b('content')}>
                <SheetsListContainer />
                <WorkspaceContainer />
            </div>
        </div>
    );
};
