import React from 'react';

import block from 'bem-cn-lite';
import {connect} from 'react-redux';
import type {Row} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';
import {registry} from 'ui/registry';

import {formSelector, innerFormSelector, readonlySelector} from '../../../store';
import {canBeRendered} from '../utils';

import {FormItem} from './FormItem';

import './FormRow.scss';

const b = block('conn-form-row');

type DispatchState = ReturnType<typeof mapStateToProps>;
type FormRowComponentProps = DispatchState &
    Row & {
        queryReadonly: boolean;
    };

const RowContainer = ({children}: {children?: React.ReactNode}) => {
    if (Array.isArray(children) && children.length === 0) {
        return null;
    }

    return <div className={b()}>{children}</div>;
};

const FormRowComponent: React.FC<FormRowComponentProps> = (props) => {
    const {form, innerForm, readonly, queryReadonly} = props;

    if ('items' in props) {
        return (
            <RowContainer>
                {props.items
                    .map((item, i) => {
                        if (
                            item.id === 'hidden' ||
                            !canBeRendered({
                                form,
                                innerForm,
                                displayConditions: item.displayConditions,
                            })
                        ) {
                            return null;
                        }

                        return (
                            <FormItem
                                key={`row-item-${i}`}
                                item={item}
                                readonly={readonly || queryReadonly}
                            />
                        );
                    })
                    .filter(Boolean)}
            </RowContainer>
        );
    }

    if (
        'type' in props &&
        canBeRendered({form, innerForm, displayConditions: props.displayConditions})
    ) {
        const {PreparedRowItem} = registry.connections.components.getAll();

        return (
            <RowContainer>
                <PreparedRowItem {...props} disabled={readonly || queryReadonly} />
            </RowContainer>
        );
    }

    return null;
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        form: formSelector(state),
        innerForm: innerFormSelector(state),
        readonly: readonlySelector(state),
    };
};

export const FormRow = connect(mapStateToProps)(FormRowComponent);
