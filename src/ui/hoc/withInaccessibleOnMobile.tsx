import React from 'react';

import {DL} from 'ui';

import InaccessibleOnMobileInset from '../components/InaccessibleOnMobileInset/InaccessibleOnMobileInset';

export default function withInaccessibleOnMobile<T>(WrappedComponent: React.ComponentType<T>) {
    const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    return class WithInaccessibleOnMobile extends React.Component<T> {
        static displayName = `withInaccessibleOnMobile(${componentName})`;

        state = {switchedToDesktopVersion: false};

        switchToDesktopVersion = () => this.setState({switchedToDesktopVersion: true});

        render() {
            return DL.IS_MOBILE && !this.state.switchedToDesktopVersion ? (
                <InaccessibleOnMobileInset switchToDesktopVersion={this.switchToDesktopVersion} />
            ) : (
                <WrappedComponent {...this.props} />
            );
        }
    };
}
