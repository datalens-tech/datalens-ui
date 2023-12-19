import React from 'react';

import block from 'bem-cn-lite';

import {ActionBarContainer, DocsListContainer, WorkspaceContainer} from './containers';

import './Yadocs.scss';

const b = block('conn-form-yadocs');

export const Yadocs = () => {
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
