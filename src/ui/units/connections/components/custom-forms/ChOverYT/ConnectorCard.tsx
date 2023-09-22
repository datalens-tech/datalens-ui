import React from 'react';

import {ChevronRight} from '@gravity-ui/icons';
import block from 'bem-cn-lite';
import {Link} from 'react-router-dom';
import {ConnectionsFormQA, ConnectorType} from 'shared';

import {getNextRalativePathname} from '../../../utils';
import {FormTitle} from '../../FormTitle/FormTitle';

import {ChytPath} from './constants';

const b = block('conn-form-chyt');

type Props = {
    type: ConnectorType;
    title: string;
    description: string;
};

export const ConnectorCard = ({type, title, description}: Props) => {
    const authType =
        type === ConnectorType.ChOverYtUserAuth ? ChytPath.USER_AUTH : ChytPath.TOKEN_AUTH;
    const dataQa =
        type === ConnectorType.ChOverYtUserAuth
            ? ConnectionsFormQA.CREATE_CHYT_USER_AUTH_NAV
            : ConnectionsFormQA.CREATE_CHYT_TOKEN_AUTH_NAV;
    const chevron = (
        <div className={b('card-title-additional')}>
            <ChevronRight />
        </div>
    );

    return (
        <Link className={b('card-wrap')} to={getNextRalativePathname(authType)}>
            <div data-qa={dataQa} className={b('card')} tabIndex={1}>
                <FormTitle
                    className={b('card-title')}
                    titleClassName={b('card-title-content')}
                    type={type}
                    title={title}
                    additionalContent={chevron}
                    showArrow={false}
                />
                <span className={b('card-description')}>{description}</span>
            </div>
        </Link>
    );
};
