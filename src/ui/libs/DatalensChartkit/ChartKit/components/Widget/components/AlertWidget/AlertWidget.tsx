import React from 'react';

import {Link} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';

import type {Alert, AlertData, WidgetProps} from '../../../../../types';

import {computeFitSinglestatStyle, computeFitTileStyle} from './utils';

import './Alert.scss';

const b = block('chartkit-alert');

type AlertPropsData = {
    data: AlertData;
};

export type AlertProps = Omit<WidgetProps, 'data'> & {
    data: AlertPropsData;
};

type State = {
    tileHeight: number;
    tileWidth: number;
    tileMargin: number;
    tilePadding: number;
    labelFontSize: number;
    annotationFontSize: number;
};

export class AlertWidget extends React.Component<AlertProps, State> {
    container: React.RefObject<HTMLDivElement> = React.createRef();

    state = {
        tileHeight: 0,
        tileWidth: 0,
        tileMargin: 0,
        tilePadding: 0,
        labelFontSize: 0,
        annotationFontSize: 0,
    };

    debouncedSetAlertSizes = debounce(() => {
        this.setAlertSizes();
    }, 100);

    componentDidMount() {
        this.setAlertSizes();
        if (this.props.onLoad) {
            this.props.onLoad({widget: this.props.data.data});
        }

        window.addEventListener('resize', this.debouncedSetAlertSizes);
    }
    componentDidUpdate(prevProps: AlertProps) {
        const {data} = this.props.data;
        const {alerts} = data;

        if (this.props.onLoad) {
            this.props.onLoad({widget: this.props.data.data});
        }

        if (!isEqual(prevProps.data.data.alerts, alerts)) {
            this.setAlertSizes();
        }
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.debouncedSetAlertSizes);
    }
    render() {
        const {data} = this.props.data;
        const {alerts = []} = data;

        return (
            <div className={b()} ref={this.container}>
                <div className={b('container')}>{alerts.map(this.renderAlert)}</div>
            </div>
        );
    }
    setAlertSizes = () => {
        const {data} = this.props.data;
        const {alerts = [], type} = data;

        const areaWidth = this.container.current?.offsetWidth || 0;
        const areaHeight = this.container.current?.offsetHeight || 0;

        const tileStyles =
            type === 'single'
                ? computeFitSinglestatStyle(areaWidth, areaHeight, alerts[0])
                : computeFitTileStyle(areaWidth, areaHeight, alerts);

        this.setState({
            ...tileStyles,
        });
    };
    renderLabel = (label: string, index: number) => {
        return (
            <div
                key={`label_${index}`}
                style={{fontSize: this.state.labelFontSize}}
                className={b('alert-label')}
            >
                {label}
            </div>
        );
    };
    renderAnnotation = (annotation: string, index: number) => {
        return (
            <div
                key={`annotation_${index}`}
                style={{fontSize: this.state.annotationFontSize}}
                className={b('alert-annotation')}
            >
                {annotation}
            </div>
        );
    };
    renderAlert = (alert: Alert, index: number) => {
        const labels = Object.values(alert.labels);
        const annotations = Object.values(alert.annotations);
        const {tileHeight, tileWidth, tileMargin, tilePadding} = this.state;

        const tileStyles = {
            height: tileHeight,
            width: tileWidth,
            margin: tileMargin,
            padding: tilePadding,
        };

        return (
            <Link
                key={index}
                className={b('alert', {status: alert.evaluationStatusCode})}
                href={alert.link}
                style={tileStyles}
                target="_blank"
                rel="noopener noreferrer"
            >
                {labels.map(this.renderLabel)}
                {annotations.map(this.renderAnnotation)}
            </Link>
        );
    };
}
