import React from 'react';

import block from 'bem-cn-lite';
import throttle from 'lodash/throttle';

import './DeferredInitializer.scss';

const b = block('deferred-initializer');

let id = 0;

// An object in the values of which we store references to components awaiting initialization - i.e. the moment when they appear in
// viewport area
const uninitializedComponents: {[key: string]: DeferredInitializer} = {};

// Scroll event handler - bypasses all components waiting for initialization and calls a validating method to check
// position on the page relative to the viewport
const handlePageScroll = () => {
    const keys: string[] = Object.keys(uninitializedComponents);

    keys.forEach((key) => {
        const component = uninitializedComponents[key];

        component.checkViewportPosition();
    });
};

const throttledCheckViewportPosition = throttle(handlePageScroll, 300);

const bindScrollHandler = () => {
    window.document.addEventListener('scroll', throttledCheckViewportPosition, true);
};

const unbindScrollHandler = () => {
    window.document.removeEventListener('scroll', throttledCheckViewportPosition, true);
};

// Adding a property to the uninitializedComponents object. If, at the same time, initially, the object is empty
// handler for the scroll event is used
const trackComponentPosition = (component: DeferredInitializer, key: string) => {
    if (!Object.keys(uninitializedComponents).length) {
        bindScrollHandler();
    }

    uninitializedComponents[key] = component;
};

// Deleting a property from an uninitializedComponents object. If, after deletion, the object becomes empty -
// scroll events handler is deleted (all components have waited for initialization)
const untrackComponentPosition = (key: string) => {
    delete uninitializedComponents[key];

    if (!Object.keys(uninitializedComponents).length) {
        unbindScrollHandler();
    }
};

interface DeferredInitializerProps {
    deferred: boolean;
    onChange: (isDeferred: boolean) => void;
    deferredInitializationMargin: number;
}

interface DeferredInitializerState {
    initialized: boolean;
}

class DeferredInitializer extends React.PureComponent<
    DeferredInitializerProps,
    DeferredInitializerState
> {
    static defaultProps = {
        deferredInitializationMargin: window.innerHeight,
    };

    // For ChartKit.resetDeferred, to initially load the components outside the viewport.
    // In theory, this is not quite correct, because due to a change in the props.deferred component is updated,
    // but in this case, it is still updated, because props.children are new every time
    static getDerivedStateFromProps(
        nextProps: DeferredInitializerProps,
        prevState: DeferredInitializerState,
    ) {
        if (nextProps.deferred && !prevState.initialized) {
            return {initialized: true};
        }
        return null;
    }

    private readonly currentKey: string;
    private readonly root: React.RefObject<HTMLInputElement>;
    // Do not store in state to prevent rerender when changing the value via setState
    private deferred = true;

    constructor(props: DeferredInitializerProps) {
        super(props);

        this.root = React.createRef();
        this.currentKey = String(id++);
        this.state = {initialized: false};

        trackComponentPosition(this, this.currentKey);
    }

    componentDidMount() {
        this.checkViewportPosition();
    }

    componentWillUnmount() {
        untrackComponentPosition(this.currentKey);
    }

    render() {
        return (
            <div ref={this.root} className={b()}>
                {this.state.initialized ? this.props.children : null}
            </div>
        );
    }

    checkViewportPosition(): void {
        if (!this.root.current) {
            return;
        }

        const {top, height}: {top: number; height: number} =
            this.root.current.getBoundingClientRect();
        const bottom: number = top + height;

        if (top < window.innerHeight + this.props.deferredInitializationMargin && bottom >= 0) {
            // depending on the result getDerivedStateFromProps may be superfluous
            if (!this.state.initialized) {
                this.setState({initialized: true});
            }
            if (this.deferred) {
                this.deferred = false;
                this.props.onChange(false);
            }
        } else if (!this.deferred) {
            this.deferred = true;
            this.props.onChange(true);
        }
    }
}

export default DeferredInitializer;
