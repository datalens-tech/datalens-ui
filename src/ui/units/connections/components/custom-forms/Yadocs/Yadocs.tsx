import React from 'react';

import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';

import {setYadocsFormData} from '../../../store';

import {ActionBarContainer, DocsListContainer, WorkspaceContainer} from './containers';

import './Yadocs.scss';

const b = block('conn-form-yadocs');

export const Yadocs = () => {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(setYadocsFormData());
    }, [dispatch]);

    return (
        <div className={b()}>
            <ActionBarContainer />
            <div className={b('content')}>
                <DocsListContainer />
                <WorkspaceContainer />
            </div>
        </div>
    );
};
