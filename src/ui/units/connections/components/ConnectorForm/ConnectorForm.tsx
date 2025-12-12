import React from 'react';

import block from 'bem-cn-lite';
import {batch, useDispatch, useSelector} from 'react-redux';
import type {ConnectorType} from 'shared';
import {registry} from 'ui/registry';

import {
    formSchemaSelector,
    getConnectorSchema,
    newConnectionSelector,
    schemaLoadingSelector,
    setInitialState,
} from '../../store';
import {FormTitle} from '../FormTitle/FormTitle';
import {WrappedLoader} from '../WrappedLoader/WrappedLoader';

import {FormActions} from './FormActions/FormActions';
import {FormRow} from './FormRow/FormRow';

import './ConnectorForm.scss';

const b = block('conn-form');

type Props = {
    type: ConnectorType;
    readonly?: boolean;
};

export const ConnectorForm = ({type, readonly = false}: Props) => {
    const dispatch = useDispatch();
    const schema = useSelector(formSchemaSelector);
    const isNewConnection = useSelector(newConnectionSelector);
    const loading = useSelector(schemaLoadingSelector);

    React.useEffect(() => {
        if (!schema && !loading) {
            dispatch(getConnectorSchema(type));
        }
    }, [dispatch, type, schema, loading]);

    React.useEffect(() => {
        return () => {
            const beforeConnectorFormUnmount = registry.connections.functions.get(
                'beforeConnectorFormUnmount',
            );
            batch(() => {
                beforeConnectorFormUnmount(dispatch);
                dispatch(setInitialState());
            });
        };
    }, [dispatch]);

    if (loading) {
        return <WrappedLoader />;
    }

    if (!schema) {
        return null;
    }

    return (
        <div className={b()}>
            <FormTitle type={type} title={schema.title} showArrow={isNewConnection} />
            <div className={b('rows')}>
                {schema.rows.map((row, i) => (
                    <FormRow key={`row-${i}`} {...row} queryReadonly={readonly} />
                ))}
            </div>
            <FormActions />
        </div>
    );
};
