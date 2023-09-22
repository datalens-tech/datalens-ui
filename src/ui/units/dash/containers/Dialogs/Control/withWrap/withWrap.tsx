import React from 'react';

import Wrapper from '../Wrapper/Wrapper';

export interface WithWrapProps {
    title?: string;
}

function withWrap<T extends WithWrapProps = WithWrapProps>(
    WrappedComponent: React.ComponentType<T> | React.FunctionComponent<T>,
) {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    return class ComponentWithWrap extends React.PureComponent<T> {
        static displayName = `withWrap(${displayName})`;

        render() {
            const {title, ...restProps} = this.props as T;

            return (
                <Wrapper title={title}>
                    <WrappedComponent {...(restProps as T)} />
                </Wrapper>
            );
        }
    };
}

export default withWrap;
