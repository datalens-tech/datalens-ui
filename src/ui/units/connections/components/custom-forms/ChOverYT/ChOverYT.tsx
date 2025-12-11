import React from 'react';

import {Redirect, Route, Switch} from 'react-router-dom';
import {ConnectorType} from 'shared';
import type {ConnectorItem} from 'shared/schema';

import {isConnectorInList} from '../../../utils';
import {ConnectorForm} from '../../ConnectorForm/ConnectorForm';

import {ChoicePage} from './ChoicePage';
import {ChytPath} from './constants';

import './ChOverYT.scss';

type Props = {
    connectors: NonNullable<ConnectorItem['includes']>;
};

export const ChOverYT = (props: Props) => {
    const {connectors} = props;

    return (
        <Switch>
            <Route
                exact
                path={`*/${ChytPath.ROOT}`}
                render={() => <ChoicePage connectors={connectors} />}
            />
            {isConnectorInList(connectors, ConnectorType.ChOverYt) && (
                <Route
                    path={`*/${ChytPath.ROOT}/${ChytPath.TOKEN_AUTH}`}
                    render={() => <ConnectorForm readonly={false} type={ConnectorType.ChOverYt} />}
                />
            )}
            {isConnectorInList(connectors, ConnectorType.ChOverYtUserAuth) && (
                <Route
                    path={`*/${ChytPath.ROOT}/${ChytPath.USER_AUTH}`}
                    render={() => (
                        <ConnectorForm readonly={false} type={ConnectorType.ChOverYtUserAuth} />
                    )}
                />
            )}
            <Route path="*" render={() => <Redirect to={`/connections/new/${ChytPath.ROOT}`} />} />
        </Switch>
    );
};
