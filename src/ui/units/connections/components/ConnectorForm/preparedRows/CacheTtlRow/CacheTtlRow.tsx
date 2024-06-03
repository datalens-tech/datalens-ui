import React from 'react';

import {I18n} from 'i18n';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {CacheTtlRowItem} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';

import {InnerFieldKey} from '../../../../constants';
import {changeForm, changeInnerForm} from '../../../../store';
import {Input, Label, RadioButton} from '../../components';

const i18n = I18n.keyset('connections.form');
const CACHE_TTL_MIN = 0;
const CACHE_TTL_MAX = 24 * 60 * 60;
const CACHE_TTL_MODE = {
    DEFAULT: 'default',
    CUSTOMIZABLE: 'customizable',
};

type DispatchState = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type CacheTtlRowProps = DispatchState & DispatchProps & Omit<CacheTtlRowItem, 'type'>;

const getInitialCacheTtlMode = (value?: string | null) => {
    return value ? CACHE_TTL_MODE.CUSTOMIZABLE : CACHE_TTL_MODE.DEFAULT;
};

const getPreparedCacheValue = (value: string) => {
    if (value === '') {
        return null;
    }

    let result = Number(value);

    if (result < CACHE_TTL_MIN) {
        result = CACHE_TTL_MIN;
    } else if (result > CACHE_TTL_MAX) {
        result = CACHE_TTL_MAX;
    }

    return String(result);
};

const CacheTtlRowComponent = (props: CacheTtlRowProps) => {
    const {actions, form, innerForm, labelText, disabled, name} = props;
    const value = form[name] as string | null;
    const cacheTtlMode = innerForm[InnerFieldKey.CacheTtlMode] as string;

    const radioButtonBeforeUpdateHandler = (nextCacheTtlMode: string) => {
        const nextCacheTtlSec = nextCacheTtlMode === CACHE_TTL_MODE.DEFAULT ? null : '0';
        actions.changeForm({[name]: nextCacheTtlSec});
    };

    React.useEffect(() => {
        const initialCacheTtlMode = getInitialCacheTtlMode(value);
        actions.changeInnerForm({[InnerFieldKey.CacheTtlMode]: initialCacheTtlMode});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <React.Fragment>
            <Label text={labelText || i18n('field_cache-ttl-sec')} />
            <RadioButton
                name={InnerFieldKey.CacheTtlMode}
                options={[
                    {text: i18n('value_default'), value: CACHE_TTL_MODE.DEFAULT},
                    {
                        text: i18n('value_customizable-cache-ttl'),
                        value: CACHE_TTL_MODE.CUSTOMIZABLE,
                    },
                ]}
                inner={true}
                controlProps={{disabled}}
                beforeUpdate={radioButtonBeforeUpdateHandler}
            />
            {cacheTtlMode === CACHE_TTL_MODE.CUSTOMIZABLE && (
                <Input
                    name={name}
                    width="s"
                    controlProps={{
                        disabled,
                        type: 'number',
                        controlProps: {min: CACHE_TTL_MIN, max: CACHE_TTL_MAX},
                    }}
                    prepareValue={getPreparedCacheValue}
                />
            )}
        </React.Fragment>
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        form: state.connections.form,
        innerForm: state.connections.innerForm,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                changeForm,
                changeInnerForm,
            },
            dispatch,
        ),
    };
};

export const CacheTtlRow = connect(mapStateToProps, mapDispatchToProps)(CacheTtlRowComponent);
