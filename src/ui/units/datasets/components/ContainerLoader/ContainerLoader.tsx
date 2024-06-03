import React from 'react';

import type {LoaderProps} from '@gravity-ui/uikit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './ContainerLoader.scss';

interface ContainerLoaderProps {
    loaderSize?: LoaderProps['size'];
    textSize?: 's' | 'm';
    className?: string;
    text?: string;
    showDelay?: number;
    topContent?: React.ReactNode;
}

interface ContainerLoaderState {
    shown: boolean;
}

const b = block('ds-container-loader');

export default class ContainerLoader extends React.Component<
    ContainerLoaderProps,
    ContainerLoaderState
> {
    timer?: number;

    state: ContainerLoaderState = {
        shown: false,
    };

    componentDidMount() {
        this.showWithDelay();
    }

    componentWillUnmount() {
        this.clearTimer();
    }

    render() {
        const {className, text, topContent, textSize = 's', loaderSize = 'm'} = this.props;
        const {shown} = this.state;

        if (!shown) {
            return null;
        }

        return (
            <div className={b(null, className)}>
                {topContent}
                <div className={b('inner')}>
                    <div className={b('text', {[`size-${textSize}`]: true})}>{text}</div>
                    <div className={b('icon')}>
                        <Loader size={loaderSize} />
                    </div>
                </div>
            </div>
        );
    }

    private showWithDelay() {
        const {showDelay = 250} = this.props;

        this.timer = window.setTimeout(() => {
            this.setState({shown: true});
        }, showDelay);
    }

    private clearTimer() {
        clearTimeout(this.timer);
        this.timer = undefined;
    }
}
