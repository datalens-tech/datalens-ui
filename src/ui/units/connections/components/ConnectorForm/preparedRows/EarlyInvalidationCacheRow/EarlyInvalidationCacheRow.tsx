import React from 'react';

import {Switch, Text, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {batch, useDispatch, useSelector} from 'react-redux';
import type {EarlyInvalidationCacheRowItem} from 'shared/schema';
import {getEarlyInvalidationCacheMockText} from 'ui/units/datasets/helpers/mockTexts';

import {InnerFieldKey} from '../../../../constants';
import {changeForm, changeInnerForm, formSelector, innerFormSelector} from '../../../../store';
import {Label} from '../../components';
import {getPreparedCacheValue} from '../../utils';

import './EarlyInvalidationCacheRow.scss';

type EarlyInvalidationCacheRowNewProps = Omit<EarlyInvalidationCacheRowItem, 'type'>;
const CACHE_INVALIDATION_MIN = 30;
const CACHE_INVALIDATION_MAX = 24 * 60 * 60;

const b = block('conn-form-early-invalidation-cache');

export const EarlyInvalidationCacheRow = (props: EarlyInvalidationCacheRowNewProps) => {
    const form = useSelector(formSelector);
    const innerForm = useSelector(innerFormSelector);

    const dispatch = useDispatch();
    const {labelText, name, disabled} = props;

    const value = form[name] as string | null;
    const [localValue, setLocalValue] = React.useState(value ?? '');
    const [isFocused, setIsFocused] = React.useState(false);
    const earlyInvalidationCacheEnabled = innerForm[
        InnerFieldKey.EarlyInvalidationCache
    ] as boolean;

    React.useEffect(() => {
        if (!isFocused) {
            setLocalValue(value ?? '');
        }
    }, [value, isFocused]);

    React.useEffect(() => {
        dispatch(changeInnerForm({[InnerFieldKey.EarlyInvalidationCache]: Boolean(value)}));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInputUpdate = React.useCallback(
        (nextValue: string) => {
            setLocalValue(nextValue);
            if (nextValue === '') {
                dispatch(changeForm({[name]: null}));
            }
        },
        [dispatch, name],
    );

    const handleBlur = React.useCallback(() => {
        setIsFocused(false);
        const prepared = getPreparedCacheValue({
            value: localValue,
            maxValue: CACHE_INVALIDATION_MAX,
            minValue: CACHE_INVALIDATION_MIN,
        });
        dispatch(changeForm({[name]: prepared}));
    }, [dispatch, name, localValue]);

    const handleFocus = React.useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleSwitchUpdate = React.useCallback(
        (checked: boolean) => {
            const nextValue = checked ? String(CACHE_INVALIDATION_MIN) : null;
            batch(() => {
                dispatch(changeInnerForm({[InnerFieldKey.EarlyInvalidationCache]: checked}));
                dispatch(changeForm({[name]: nextValue}));
            });
            setLocalValue(checked ? String(CACHE_INVALIDATION_MIN) : '');
        },
        [dispatch, name],
    );

    return (
        <React.Fragment>
            <Label
                text={
                    labelText ||
                    getEarlyInvalidationCacheMockText(
                        'field_cache_invalidation_throttling_interval_sec',
                    )
                }
            />
            <Switch
                className={b('switch')}
                name={InnerFieldKey.EarlyInvalidationCache}
                checked={earlyInvalidationCacheEnabled}
                size="m"
                onUpdate={handleSwitchUpdate}
                disabled={disabled}
            />
            {earlyInvalidationCacheEnabled && (
                <React.Fragment>
                    <Text className={b('label')}>
                        {getEarlyInvalidationCacheMockText(
                            'field_cache_invalidation_throttling_interval_sec_notice',
                        )}
                    </Text>
                    <TextInput
                        className={b('input')}
                        name={name}
                        type="number"
                        size="m"
                        value={localValue}
                        disabled={disabled}
                        hasClear
                        onUpdate={handleInputUpdate}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        controlProps={{
                            min: CACHE_INVALIDATION_MIN,
                            max: CACHE_INVALIDATION_MAX,
                        }}
                    />
                    <Text className={b('label')}>
                        {getEarlyInvalidationCacheMockText(
                            'field_cache_invalidation_throttling_interval_sec_unit',
                        )}
                    </Text>
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
