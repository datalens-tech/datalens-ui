import React from 'react';

import block from 'bem-cn-lite';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';
import type {BaseControlItem} from 'shared/schema/types';

import {MarkdownItem} from '../';
import type {ValidationError} from '../../../../typings';
import {getErrorMessage, getValidationError} from '../../../../utils';

import './withControlWrap.scss';

const b = block('conn-form-control');

type WithControlWrapProps<T> = T & {
    name: string;
    validationErrors?: ValidationError[];
    width?: BaseControlItem['width'];
    hintText?: BaseControlItem['hintText'];
};

const getStyles = ({
    width,
}: {
    width: BaseControlItem['width'];
}): {className: string; style?: React.HTMLAttributes<HTMLDivElement>['style']} => {
    if (typeof width === 'number') {
        return {className: b(), style: {width}};
    }

    return {className: b({[`width-${width}`]: true})};
};

export function withControlWrap<T = unknown>(WrappedComponent: React.ComponentType<T>) {
    const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    return class WithControlWrap extends React.Component<WithControlWrapProps<T>> {
        static displayName = `withControlWrap(${componentName})`;

        render() {
            const {name, validationErrors, width = 'auto', hintText} = this.props;
            const {className, style} = getStyles({width});
            const error = getValidationError(name, validationErrors);

            return (
                <div style={style} className={className}>
                    <FieldWrapper error={getErrorMessage(error?.type)}>
                        <WrappedComponent {...this.props} />
                    </FieldWrapper>
                    {hintText && (
                        <span className={b('hint')}>
                            <MarkdownItem text={hintText} />
                        </span>
                    )}
                </div>
            );
        }
    };
}
