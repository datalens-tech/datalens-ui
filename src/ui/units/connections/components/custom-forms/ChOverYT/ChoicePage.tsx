import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {ConnectorType} from 'shared';
import type {ConnectorItem} from 'shared/schema';

import {ConnectorAlias} from '../../../../../constants';
import {setInitialState} from '../../../store';
import {isConnectorInList} from '../../../utils';
import {FormTitle} from '../../FormTitle/FormTitle';

import {ConnectorCard} from './ConnectorCard';
import {Notification} from './Notification';

import './ChOverYT.scss';

const b = block('conn-form-chyt');
const i18n = I18n.keyset('connections.form');
const i18nConnList = I18n.keyset('connections.connectors-list.view');

type Props = {
    connectors: NonNullable<ConnectorItem['includes']>;
};

export const ChoicePage = (props: Props) => {
    const {connectors} = props;
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(setInitialState());
    }, [dispatch]);

    return (
        <div className={b()}>
            <FormTitle
                type={ConnectorAlias.CHYT}
                title={i18n('label_authentication-method-choice')}
            />
            {isConnectorInList(connectors, ConnectorType.ChOverYtUserAuth) && (
                <ConnectorCard
                    type={ConnectorType.ChOverYtUserAuth}
                    title={i18nConnList(`label_connector-${ConnectorType.ChOverYtUserAuth}`)}
                    description={i18n('label_chyt-user-auth-description')}
                />
            )}
            {isConnectorInList(connectors, ConnectorType.ChOverYt) && (
                <ConnectorCard
                    type={ConnectorType.ChOverYt}
                    title={i18nConnList(`label_connector-${ConnectorType.ChOverYt}`)}
                    description={i18n('label_chyt-token-auth-description')}
                />
            )}
            <Notification text={i18n('label_auth-method-hint')} />
        </div>
    );
};
